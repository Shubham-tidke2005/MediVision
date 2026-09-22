import argparse
import json
from pathlib import Path

from PIL import Image

from phase38_config import CLASS_NAMES, DISPLAY_NAMES
from phase38_transforms import build_eval_transform
from phase38_utils import get_device
from phase39_config import EXAMPLES_DIR, TARGET_LAYER_NAME
from phase39_gradcam import GradCAM
from phase39_model import get_gradcam_target_layer, load_phase38_model
from phase39_visualize import build_overlay, save_visualization_bundle


def make_safe_name(image_path: Path) -> str:
    return image_path.stem.replace(" ", "_")


def run_gradcam_for_image(
    *,
    image_path: Path,
    output_directory: Path | None = None,
    target_class_name: str | None = None,
):
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        raise ValueError("Supported image formats are .jpg, .jpeg, and .png.")

    device = get_device()
    print(f"Using device: {device}")

    model, checkpoint = load_phase38_model(device)
    original_image = Image.open(image_path).convert("RGB")
    input_tensor = build_eval_transform()(original_image).unsqueeze(0).to(device)

    class_index = None
    if target_class_name is not None:
        if target_class_name not in CLASS_NAMES:
            raise ValueError(f"Unknown target class. Choose from: {CLASS_NAMES}")
        class_index = CLASS_NAMES.index(target_class_name)

    gradcam = GradCAM(
        model=model,
        target_layer=get_gradcam_target_layer(model),
    )

    try:
        heatmap_tensor, predicted_index, probabilities, target_index = (
            gradcam.generate(
                input_tensor=input_tensor,
                class_index=class_index,
            )
        )
    finally:
        gradcam.remove_hooks()

    heatmap_image, overlay_image = build_overlay(
        original_image=original_image,
        heatmap=heatmap_tensor.numpy(),
    )

    predicted_class = CLASS_NAMES[predicted_index]
    predicted_label = DISPLAY_NAMES[predicted_class]
    model_score = float(probabilities[predicted_index].item())
    target_class = CLASS_NAMES[target_index]

    if output_directory is None:
        output_directory = EXAMPLES_DIR / make_safe_name(image_path)

    paths = save_visualization_bundle(
        output_directory=output_directory,
        original_image=original_image,
        heatmap_image=heatmap_image,
        overlay_image=overlay_image,
        predicted_label=predicted_label,
        model_score=model_score,
    )

    class_scores = {
        CLASS_NAMES[index]: float(probabilities[index].item())
        for index in range(len(CLASS_NAMES))
    }

    result = {
        "source_image": str(image_path.resolve()),
        "prediction": {
            "class": predicted_class,
            "display_label": predicted_label,
            "model_score": model_score,
        },
        "gradcam_target_class": target_class,
        "class_scores": class_scores,
        "target_layer": TARGET_LAYER_NAME,
        "model": {
            "architecture": checkpoint.get("architecture", "resnet18"),
            "task": checkpoint.get(
                "task",
                "brain_mri_4_class_classification",
            ),
        },
        "outputs": {
            key: str(value.resolve()) for key, value in paths.items()
        },
        "interpretation_notice": (
            "Grad-CAM shows image regions that influenced this model "
            "prediction. It is not proof of disease, lesion location, "
            "or clinical diagnosis."
        ),
        "score_notice": (
            "The model score is a softmax output from this classifier "
            "and is not the probability that a patient has a disease."
        ),
    }

    result_path = output_directory / "result.json"
    with result_path.open("w", encoding="utf-8") as file_handle:
        json.dump(result, file_handle, indent=2)

    print("\n========== PHASE 39 GRAD-CAM ==========")
    print(f"Prediction: {predicted_label}")
    print(f"Model score: {model_score:.2%}")
    print(f"Grad-CAM target: {DISPLAY_NAMES[target_class]}")
    print("\nClass scores:")
    for class_name in CLASS_NAMES:
        print(f"  {DISPLAY_NAMES[class_name]}: {class_scores[class_name]:.2%}")

    print("\nGrad-CAM overlay:")
    print(paths["overlay"])
    print("\nSummary image:")
    print(paths["summary"])
    print("\nResult JSON:")
    print(result_path)
    print("\nImportant: Grad-CAM is a model visualization, not proof of disease.")
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Generate Grad-CAM for the Phase 38 Brain MRI ResNet18 model."
    )
    parser.add_argument(
        "--image",
        required=True,
        help="Path to a .jpg, .jpeg, or .png Brain MRI image.",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Optional output directory.",
    )
    parser.add_argument(
        "--target-class",
        choices=CLASS_NAMES,
        default=None,
        help="Optional class to explain. Default: predicted class.",
    )
    args = parser.parse_args()

    run_gradcam_for_image(
        image_path=Path(args.image),
        output_directory=Path(args.output) if args.output else None,
        target_class_name=args.target_class,
    )


if __name__ == "__main__":
    main()
