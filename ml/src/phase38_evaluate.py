import json

import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from phase38_config import (
    CLASS_NAMES,
    DISPLAY_NAMES,
    FINAL_MODEL_PATH,
    METRICS_DIR,
    MODELS_DIR,
    PLOTS_DIR,
    RANDOM_SEED,
)
from phase38_dataset import (
    build_dataloaders,
)
from phase38_model import (
    build_resnet18,
)
from phase38_utils import (
    ensure_directories,
    get_device,
    save_json,
    set_random_seed,
)


def collect_predictions(
    *,
    model,
    data_loader,
    device,
):
    model.eval()

    all_targets = []

    all_predictions = []

    all_scores = []

    with torch.no_grad():
        for (
            inputs,
            targets,
        ) in data_loader:
            inputs = inputs.to(
                device,
                non_blocking=True,
            )

            outputs = model(
                inputs
            )

            probabilities = (
                torch.softmax(
                    outputs,
                    dim=1,
                )
            )

            predictions = (
                probabilities.argmax(
                    dim=1
                )
            )

            all_targets.extend(
                targets.cpu().tolist()
            )

            all_predictions.extend(
                predictions.cpu().tolist()
            )

            all_scores.extend(
                probabilities.cpu().tolist()
            )

    return (
        np.asarray(
            all_targets
        ),

        np.asarray(
            all_predictions
        ),

        np.asarray(
            all_scores
        ),
    )


def save_confusion_matrix(
    matrix: np.ndarray,
):
    labels = [
        DISPLAY_NAMES[
            class_name
        ]
        for class_name
        in CLASS_NAMES
    ]

    plt.figure(
        figsize=(
            8,
            7,
        )
    )

    image = plt.imshow(
        matrix
    )

    plt.colorbar(
        image
    )

    positions = np.arange(
        len(
            labels
        )
    )

    plt.xticks(
        positions,
        labels,
        rotation=35,
        ha="right",
    )

    plt.yticks(
        positions,
        labels,
    )

    plt.xlabel(
        "Predicted Class"
    )

    plt.ylabel(
        "True Class"
    )

    plt.title(
        "Brain MRI ResNet18 Confusion Matrix"
    )

    threshold = (
        matrix.max()
        / 2.0
        if matrix.size
        else 0
    )

    for row in range(
        matrix.shape[
            0
        ]
    ):
        for column in range(
            matrix.shape[
                1
            ]
        ):
            plt.text(
                column,
                row,
                str(
                    matrix[
                        row,
                        column,
                    ]
                ),
                ha="center",
                va="center",
            )

    plt.tight_layout()

    plt.savefig(
        PLOTS_DIR
        / "confusion_matrix.png",
        dpi=180,
    )

    plt.close()


def main():
    set_random_seed(
        RANDOM_SEED
    )

    ensure_directories(
        MODELS_DIR,
        METRICS_DIR,
        PLOTS_DIR,
    )

    if not FINAL_MODEL_PATH.is_file():
        raise RuntimeError(
            "Final model not found. Train Phase 38 first:\n"
            f"{FINAL_MODEL_PATH}"
        )

    device = get_device()

    print(
        f"Using device: {device}"
    )

    (
        _,
        _,
        test_loader,
    ) = build_dataloaders()

    checkpoint = torch.load(
        FINAL_MODEL_PATH,
        map_location=device,
        weights_only=False,
    )

    saved_classes = checkpoint.get(
        "class_names"
    )

    if saved_classes != CLASS_NAMES:
        raise RuntimeError(
            "Saved model class mapping does not "
            "match current Phase 38 configuration."
        )

    model = build_resnet18()

    model.load_state_dict(
        checkpoint[
            "model_state_dict"
        ]
    )

    model = model.to(
        device
    )

    (
        targets,
        predictions,
        scores,
    ) = collect_predictions(
        model=model,
        data_loader=test_loader,
        device=device,
    )

    accuracy = accuracy_score(
        targets,
        predictions,
    )

    precision_macro = precision_score(
        targets,
        predictions,
        average="macro",
        zero_division=0,
    )

    recall_macro = recall_score(
        targets,
        predictions,
        average="macro",
        zero_division=0,
    )

    f1_macro = f1_score(
        targets,
        predictions,
        average="macro",
        zero_division=0,
    )

    report = classification_report(
        targets,
        predictions,
        target_names=[
            DISPLAY_NAMES[
                class_name
            ]
            for class_name
            in CLASS_NAMES
        ],
        output_dict=True,
        zero_division=0,
    )

    matrix = confusion_matrix(
        targets,
        predictions,
        labels=list(
            range(
                len(
                    CLASS_NAMES
                )
            )
        ),
    )

    class_wise_recall = {}

    for class_name in CLASS_NAMES:
        display_name = (
            DISPLAY_NAMES[
                class_name
            ]
        )

        class_wise_recall[
            class_name
        ] = report[
            display_name
        ][
            "recall"
        ]

    metrics = {
        "test_images":
            int(
                len(
                    targets
                )
            ),

        "accuracy":
            float(
                accuracy
            ),

        "precision_macro":
            float(
                precision_macro
            ),

        "recall_macro":
            float(
                recall_macro
            ),

        "f1_macro":
            float(
                f1_macro
            ),

        "class_wise_recall":
            {
                key:
                    float(
                        value
                    )

                for (
                    key,
                    value,
                ) in class_wise_recall.items()
            },

        "confusion_matrix":
            matrix.tolist(),

        "classification_report":
            report,

        "model_file":
            str(
                FINAL_MODEL_PATH
            ),

        "note":
            (
                "Scores describe model performance on "
                "the held-out dataset and are not "
                "clinical diagnostic probabilities."
            ),
    }

    save_json(
        (
            METRICS_DIR
            / "test_metrics.json"
        ),
        metrics,
    )

    with (
        METRICS_DIR
        / "classification_report.txt"
    ).open(
        "w",
        encoding="utf-8",
    ) as file_handle:
        file_handle.write(
            classification_report(
                targets,
                predictions,
                target_names=[
                    DISPLAY_NAMES[
                        class_name
                    ]
                    for class_name
                    in CLASS_NAMES
                ],
                digits=4,
                zero_division=0,
            )
        )

    save_confusion_matrix(
        matrix
    )

    print()
    print(
        "========== PHASE 38 TEST RESULTS =========="
    )

    print(
        f"Accuracy:        {accuracy:.4f}"
    )

    print(
        f"Precision macro: {precision_macro:.4f}"
    )

    print(
        f"Recall macro:    {recall_macro:.4f}"
    )

    print(
        f"F1 macro:        {f1_macro:.4f}"
    )

    print()
    print(
        "Class-wise recall:"
    )

    for class_name in CLASS_NAMES:
        print(
            f"  {DISPLAY_NAMES[class_name]}: "
            f"{class_wise_recall[class_name]:.4f}"
        )

    print()
    print(
        "Confusion matrix:"
    )

    print(
        matrix
    )

    print()
    print(
        "Metrics:"
    )

    print(
        METRICS_DIR
        / "test_metrics.json"
    )

    print()
    print(
        "Confusion matrix image:"
    )

    print(
        PLOTS_DIR
        / "confusion_matrix.png"
    )

    print()
    print(
        "Phase 38 complete."
    )


if __name__ == "__main__":
    main()
