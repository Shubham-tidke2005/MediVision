import torch

from phase38_config import CLASS_NAMES
from phase38_utils import get_device
from phase39_config import MODEL_PATH, TARGET_LAYER_NAME
from phase39_model import get_gradcam_target_layer, load_phase38_model


def main():
    device = get_device()
    print(f"Device: {device}")
    print(f"Model file: {MODEL_PATH}")

    model, checkpoint = load_phase38_model(device)
    target_layer = get_gradcam_target_layer(model)

    print(f"Architecture: {checkpoint.get('architecture', 'resnet18')}")
    print(f"Classes: {CLASS_NAMES}")
    print(f"Grad-CAM target: {TARGET_LAYER_NAME}")
    print(f"Target module: {target_layer}")

    dummy = torch.zeros((1, 3, 224, 224), device=device)
    with torch.no_grad():
        output = model(dummy)

    print(f"Model output shape: {tuple(output.shape)}")

    if tuple(output.shape) != (1, len(CLASS_NAMES)):
        raise RuntimeError("Unexpected model output shape.")

    print("Phase 39 model verification OK.")


if __name__ == "__main__":
    main()
