import torch.nn as nn
from torchvision.models import (
    ResNet18_Weights,
    resnet18,
)

from phase38_config import (
    DROPOUT,
    NUM_CLASSES,
    USE_PRETRAINED_WEIGHTS,
)


def build_resnet18():
    """
    ResNet18 transfer-learning model.

    Phase 1:
        frozen backbone + trainable classifier head

    Phase 2:
        layer4 + classifier head are fine-tuned
    """

    weights = (
        ResNet18_Weights.DEFAULT
        if USE_PRETRAINED_WEIGHTS
        else None
    )

    model = resnet18(
        weights=weights
    )

    input_features = (
        model.fc.in_features
    )

    model.fc = nn.Sequential(
        nn.Dropout(
            p=DROPOUT
        ),
        nn.Linear(
            input_features,
            NUM_CLASSES,
        ),
    )

    return model


def freeze_backbone(
    model,
):
    for parameter in (
        model.parameters()
    ):
        parameter.requires_grad = False

    for parameter in (
        model.fc.parameters()
    ):
        parameter.requires_grad = True


def unfreeze_layer4_and_head(
    model,
):
    for parameter in (
        model.parameters()
    ):
        parameter.requires_grad = False

    for parameter in (
        model.layer4.parameters()
    ):
        parameter.requires_grad = True

    for parameter in (
        model.fc.parameters()
    ):
        parameter.requires_grad = True


def trainable_parameters(
    model,
):
    return [
        parameter
        for parameter
        in model.parameters()
        if parameter.requires_grad
    ]
