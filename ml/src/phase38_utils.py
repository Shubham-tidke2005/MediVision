import csv
import json
import random
from pathlib import Path

import numpy as np
import torch


def ensure_directories(
    *directories: Path,
):
    for directory in directories:
        directory.mkdir(
            parents=True,
            exist_ok=True,
        )


def set_random_seed(
    seed: int,
):
    random.seed(
        seed
    )

    np.random.seed(
        seed
    )

    torch.manual_seed(
        seed
    )

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(
            seed
        )

    if hasattr(
        torch.backends,
        "cudnn",
    ):
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device(
            "cuda"
        )

    if (
        hasattr(
            torch.backends,
            "mps",
        )
        and
        torch.backends.mps.is_available()
    ):
        return torch.device(
            "mps"
        )

    return torch.device(
        "cpu"
    )


def save_json(
    path: Path,
    data,
):
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with path.open(
        "w",
        encoding="utf-8",
    ) as file_handle:
        json.dump(
            data,
            file_handle,
            indent=2,
        )


def save_history_csv(
    path: Path,
    history: list[dict],
):
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fieldnames = [
        "epoch",
        "stage",
        "train_loss",
        "train_accuracy",
        "val_loss",
        "val_accuracy",
        "learning_rate",
    ]

    with path.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file_handle:
        writer = csv.DictWriter(
            file_handle,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        writer.writerows(
            history
        )
