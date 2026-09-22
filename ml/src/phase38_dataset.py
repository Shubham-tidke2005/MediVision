from collections import Counter
from pathlib import Path

import torch
from torch.utils.data import (
    DataLoader,
)
from torchvision.datasets import (
    ImageFolder,
)

from phase38_config import (
    BATCH_SIZE,
    CLASS_NAMES,
    NUM_WORKERS,
    PIN_MEMORY,
    PREPARED_DATA_DIR,
)
from phase38_transforms import (
    build_eval_transform,
    build_train_transform,
)


def validate_imagefolder_classes(
    dataset: ImageFolder,
):
    if dataset.classes != CLASS_NAMES:
        raise RuntimeError(
            "Prepared dataset class order does not "
            "match Phase 38 configuration.\n"
            f"Expected: {CLASS_NAMES}\n"
            f"Found: {dataset.classes}"
        )


def build_datasets():
    train_dir = (
        PREPARED_DATA_DIR
        / "train"
    )

    val_dir = (
        PREPARED_DATA_DIR
        / "val"
    )

    test_dir = (
        PREPARED_DATA_DIR
        / "test"
    )

    for directory in (
        train_dir,
        val_dir,
        test_dir,
    ):
        if not directory.is_dir():
            raise RuntimeError(
                f"Required dataset directory missing: "
                f"{directory}"
            )

    train_dataset = ImageFolder(
        root=train_dir,
        transform=build_train_transform(),
    )

    val_dataset = ImageFolder(
        root=val_dir,
        transform=build_eval_transform(),
    )

    test_dataset = ImageFolder(
        root=test_dir,
        transform=build_eval_transform(),
    )

    validate_imagefolder_classes(
        train_dataset
    )

    validate_imagefolder_classes(
        val_dataset
    )

    validate_imagefolder_classes(
        test_dataset
    )

    return (
        train_dataset,
        val_dataset,
        test_dataset,
    )


def build_dataloaders():
    (
        train_dataset,
        val_dataset,
        test_dataset,
    ) = build_datasets()

    use_pin_memory = (
        PIN_MEMORY
        and torch.cuda.is_available()
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=use_pin_memory,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=use_pin_memory,
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=use_pin_memory,
    )

    return (
        train_loader,
        val_loader,
        test_loader,
    )


def calculate_class_weights(
    train_dataset: ImageFolder,
) -> torch.Tensor:
    """
    Balanced inverse-frequency class weights.

    Even after duplicate cleanup, the prepared training
    split is mildly imbalanced. Weighted cross entropy
    prevents the largest class from dominating training.
    """

    counts = Counter(
        train_dataset.targets
    )

    total = len(
        train_dataset.targets
    )

    number_of_classes = len(
        train_dataset.classes
    )

    weights = []

    for class_index in range(
        number_of_classes
    ):
        count = counts[
            class_index
        ]

        if count <= 0:
            raise RuntimeError(
                "A training class contains zero images."
            )

        weight = (
            total
            /
            (
                number_of_classes
                * count
            )
        )

        weights.append(
            weight
        )

    return torch.tensor(
        weights,
        dtype=torch.float32,
    )
