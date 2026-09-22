import argparse
import random
from pathlib import Path

from phase38_config import CLASS_NAMES
from phase39_config import DEFAULT_RANDOM_SEED, EXAMPLES_DIR, TEST_DATA_DIR
from phase39_run import run_gradcam_for_image

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def collect_images(directory: Path):
    return sorted(
        path
        for path in directory.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def main():
    parser = argparse.ArgumentParser(
        description="Generate representative Grad-CAM examples from the test set."
    )
    parser.add_argument("--per-class", type=int, default=1)
    parser.add_argument("--seed", type=int, default=DEFAULT_RANDOM_SEED)
    args = parser.parse_args()

    if args.per_class < 1:
        raise ValueError("--per-class must be at least 1.")

    random_generator = random.Random(args.seed)

    print("Generating Grad-CAM examples...")

    for class_name in CLASS_NAMES:
        class_directory = TEST_DATA_DIR / class_name
        if not class_directory.is_dir():
            raise RuntimeError(f"Missing test class directory: {class_directory}")

        images = collect_images(class_directory)
        if len(images) < args.per_class:
            raise RuntimeError(f"Not enough test images for {class_name}.")

        selected_images = random_generator.sample(images, args.per_class)

        for index, image_path in enumerate(selected_images, start=1):
            output_directory = (
                EXAMPLES_DIR / class_name / f"example_{index:02d}"
            )

            print("\n----------------------------------------")
            print(f"True folder: {class_name}")
            print(f"Image: {image_path.name}")

            run_gradcam_for_image(
                image_path=image_path,
                output_directory=output_directory,
            )

    print("\n========== PHASE 39 EXAMPLES COMPLETE ==========")
    print(EXAMPLES_DIR)


if __name__ == "__main__":
    main()
