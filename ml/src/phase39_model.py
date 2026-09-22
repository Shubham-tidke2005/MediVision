import torch
import torch.nn as nn
from torchvision.models import resnet18

from phase38_config import CLASS_NAMES, DROPOUT, NUM_CLASSES
from phase39_config import MODEL_PATH


def build_phase39_resnet18():
    model = resnet18(weights=None)
    input_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=DROPOUT),
        nn.Linear(input_features, NUM_CLASSES),
    )
    return model


def load_phase38_model(device: torch.device):
    if not MODEL_PATH.is_file():
        raise RuntimeError(
            "Phase 38 model was not found:\n"
            f"{MODEL_PATH}\n"
            "Complete Phase 38 training first."
        )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=device,
        weights_only=False,
    )

    saved_classes = checkpoint.get("class_names")
    if saved_classes != CLASS_NAMES:
        raise RuntimeError(
            "Saved class mapping does not match Phase 38 configuration.\n"
            f"Saved: {saved_classes}\nExpected: {CLASS_NAMES}"
        )

    model = build_phase39_resnet18()
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)
    model.eval()
    return model, checkpoint


def get_gradcam_target_layer(model):
    return model.layer4[-1].conv2
