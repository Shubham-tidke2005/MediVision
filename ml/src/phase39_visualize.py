from pathlib import Path

import numpy as np
from matplotlib import colormaps
from matplotlib import pyplot as plt
from PIL import Image

from phase39_config import HEATMAP_ALPHA


def heatmap_to_rgb(heatmap: np.ndarray) -> np.ndarray:
    heatmap = np.clip(heatmap, 0.0, 1.0)
    rgba = colormaps.get_cmap("jet")(heatmap)
    return (rgba[..., :3] * 255.0).astype(np.uint8)


def build_overlay(*, original_image: Image.Image, heatmap: np.ndarray):
    original_rgb = original_image.convert("RGB")
    original_array = np.asarray(original_rgb, dtype=np.float32)

    heatmap_image = Image.fromarray(heatmap_to_rgb(heatmap))
    heatmap_image = heatmap_image.resize(
        original_rgb.size,
        Image.Resampling.BILINEAR,
    )
    heatmap_array = np.asarray(heatmap_image, dtype=np.float32)

    overlay_array = (
        (1.0 - HEATMAP_ALPHA) * original_array
        + HEATMAP_ALPHA * heatmap_array
    )
    overlay_array = np.clip(overlay_array, 0, 255).astype(np.uint8)
    overlay_image = Image.fromarray(overlay_array)
    return heatmap_image, overlay_image


def save_visualization_bundle(
    *,
    output_directory: Path,
    original_image: Image.Image,
    heatmap_image: Image.Image,
    overlay_image: Image.Image,
    predicted_label: str,
    model_score: float,
):
    output_directory.mkdir(parents=True, exist_ok=True)

    original_path = output_directory / "original.png"
    heatmap_path = output_directory / "heatmap.png"
    overlay_path = output_directory / "gradcam_overlay.png"
    summary_path = output_directory / "gradcam_summary.png"

    original_image.convert("RGB").save(original_path)
    heatmap_image.save(heatmap_path)
    overlay_image.save(overlay_path)

    figure = plt.figure(figsize=(12, 4))
    axes = figure.subplots(1, 3)

    axes[0].imshow(original_image)
    axes[0].set_title("Original MRI")

    axes[1].imshow(heatmap_image)
    axes[1].set_title("Grad-CAM heatmap")

    axes[2].imshow(overlay_image)
    axes[2].set_title(
        f"{predicted_label}\nModel score: {model_score:.1%}"
    )

    for axis in axes:
        axis.axis("off")

    figure.suptitle(
        "Grad-CAM model visualization — not proof of disease",
        fontsize=11,
    )
    figure.tight_layout()
    figure.savefig(summary_path, dpi=180, bbox_inches="tight")
    plt.close(figure)

    return {
        "original": original_path,
        "heatmap": heatmap_path,
        "overlay": overlay_path,
        "summary": summary_path,
    }
