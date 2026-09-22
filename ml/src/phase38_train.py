import math
import time
from pathlib import Path

import matplotlib.pyplot as plt
import torch
import torch.nn as nn
from torch.optim import (
    AdamW,
)
from torch.optim.lr_scheduler import (
    ReduceLROnPlateau,
)

from phase38_config import (
    CHECKPOINTS_DIR,
    CLASS_NAMES,
    EARLY_STOPPING_PATIENCE,
    FINAL_MODEL_PATH,
    FINETUNE_EPOCHS,
    FINETUNE_LEARNING_RATE,
    HEAD_EPOCHS,
    HEAD_LEARNING_RATE,
    METRICS_DIR,
    MODELS_DIR,
    OUTPUTS_DIR,
    PLOTS_DIR,
    RANDOM_SEED,
    SCHEDULER_FACTOR,
    SCHEDULER_PATIENCE,
    WEIGHT_DECAY,
)
from phase38_dataset import (
    build_dataloaders,
    calculate_class_weights,
)
from phase38_model import (
    build_resnet18,
    freeze_backbone,
    trainable_parameters,
    unfreeze_layer4_and_head,
)
from phase38_utils import (
    ensure_directories,
    get_device,
    save_history_csv,
    save_json,
    set_random_seed,
)


def run_epoch(
    *,
    model,
    data_loader,
    criterion,
    device,
    optimizer=None,
):
    training = (
        optimizer is not None
    )

    if training:
        model.train()
    else:
        model.eval()

    running_loss = 0.0

    correct = 0

    total = 0

    context = (
        torch.enable_grad()
        if training
        else torch.no_grad()
    )

    with context:
        for (
            inputs,
            targets,
        ) in data_loader:
            inputs = inputs.to(
                device,
                non_blocking=True,
            )

            targets = targets.to(
                device,
                non_blocking=True,
            )

            if training:
                optimizer.zero_grad(
                    set_to_none=True
                )

            outputs = model(
                inputs
            )

            loss = criterion(
                outputs,
                targets,
            )

            if training:
                loss.backward()

                optimizer.step()

            batch_size = (
                inputs.size(
                    0
                )
            )

            running_loss += (
                loss.item()
                * batch_size
            )

            predictions = (
                outputs.argmax(
                    dim=1
                )
            )

            correct += (
                predictions
                .eq(
                    targets
                )
                .sum()
                .item()
            )

            total += (
                batch_size
            )

    average_loss = (
        running_loss
        / max(
            total,
            1,
        )
    )

    accuracy = (
        correct
        / max(
            total,
            1,
        )
    )

    return (
        average_loss,
        accuracy,
    )


def save_checkpoint(
    *,
    path: Path,
    model,
    optimizer,
    epoch: int,
    stage: str,
    val_loss: float,
    val_accuracy: float,
):
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    torch.save(
        {
            "epoch":
                epoch,

            "stage":
                stage,

            "model_state_dict":
                model.state_dict(),

            "optimizer_state_dict":
                optimizer.state_dict(),

            "val_loss":
                val_loss,

            "val_accuracy":
                val_accuracy,

            "class_names":
                CLASS_NAMES,
        },
        path,
    )


def train_stage(
    *,
    stage_name: str,
    model,
    train_loader,
    val_loader,
    criterion,
    device,
    number_of_epochs: int,
    learning_rate: float,
    starting_epoch: int,
    history: list[dict],
    global_best_val_loss: float,
    global_best_path: Path,
):
    optimizer = AdamW(
        trainable_parameters(
            model
        ),
        lr=learning_rate,
        weight_decay=WEIGHT_DECAY,
    )

    scheduler = ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=SCHEDULER_FACTOR,
        patience=SCHEDULER_PATIENCE,
    )

    stage_best_val_loss = math.inf

    epochs_without_improvement = 0

    for local_epoch in range(
        1,
        number_of_epochs + 1,
    ):
        epoch = (
            starting_epoch
            + local_epoch
        )

        started = time.time()

        (
            train_loss,
            train_accuracy,
        ) = run_epoch(
            model=model,
            data_loader=train_loader,
            criterion=criterion,
            device=device,
            optimizer=optimizer,
        )

        (
            val_loss,
            val_accuracy,
        ) = run_epoch(
            model=model,
            data_loader=val_loader,
            criterion=criterion,
            device=device,
            optimizer=None,
        )

        scheduler.step(
            val_loss
        )

        current_learning_rate = (
            optimizer.param_groups[
                0
            ][
                "lr"
            ]
        )

        history.append(
            {
                "epoch":
                    epoch,

                "stage":
                    stage_name,

                "train_loss":
                    train_loss,

                "train_accuracy":
                    train_accuracy,

                "val_loss":
                    val_loss,

                "val_accuracy":
                    val_accuracy,

                "learning_rate":
                    current_learning_rate,
            }
        )

        elapsed = (
            time.time()
            - started
        )

        print(
            f"[{stage_name}] "
            f"Epoch {local_epoch}/"
            f"{number_of_epochs} | "
            f"train_loss={train_loss:.4f} | "
            f"train_acc={train_accuracy:.4f} | "
            f"val_loss={val_loss:.4f} | "
            f"val_acc={val_accuracy:.4f} | "
            f"lr={current_learning_rate:.2e} | "
            f"{elapsed:.1f}s"
        )

        checkpoint_path = (
            CHECKPOINTS_DIR
            / (
                f"{stage_name}_"
                f"epoch_{epoch:02d}.pth"
            )
        )

        save_checkpoint(
            path=checkpoint_path,
            model=model,
            optimizer=optimizer,
            epoch=epoch,
            stage=stage_name,
            val_loss=val_loss,
            val_accuracy=val_accuracy,
        )

        if val_loss < stage_best_val_loss:
            stage_best_val_loss = (
                val_loss
            )

            epochs_without_improvement = 0

        else:
            epochs_without_improvement += 1

        if val_loss < global_best_val_loss:
            global_best_val_loss = (
                val_loss
            )

            save_checkpoint(
                path=global_best_path,
                model=model,
                optimizer=optimizer,
                epoch=epoch,
                stage=stage_name,
                val_loss=val_loss,
                val_accuracy=val_accuracy,
            )

            print(
                "  -> Saved new best validation model."
            )

        if (
            epochs_without_improvement
            >= EARLY_STOPPING_PATIENCE
        ):
            print(
                "  -> Early stopping for this stage."
            )
            break

    return (
        global_best_val_loss,
        epoch,
    )


def plot_training_history(
    history: list[dict],
):
    epochs = [
        row[
            "epoch"
        ]
        for row
        in history
    ]

    train_loss = [
        row[
            "train_loss"
        ]
        for row
        in history
    ]

    val_loss = [
        row[
            "val_loss"
        ]
        for row
        in history
    ]

    train_accuracy = [
        row[
            "train_accuracy"
        ]
        for row
        in history
    ]

    val_accuracy = [
        row[
            "val_accuracy"
        ]
        for row
        in history
    ]

    plt.figure(
        figsize=(
            8,
            5,
        )
    )

    plt.plot(
        epochs,
        train_loss,
        label="Train Loss",
    )

    plt.plot(
        epochs,
        val_loss,
        label="Validation Loss",
    )

    plt.xlabel(
        "Epoch"
    )

    plt.ylabel(
        "Loss"
    )

    plt.title(
        "Phase 38 Training Loss"
    )

    plt.legend()

    plt.tight_layout()

    plt.savefig(
        PLOTS_DIR
        / "training_loss.png",
        dpi=160,
    )

    plt.close()

    plt.figure(
        figsize=(
            8,
            5,
        )
    )

    plt.plot(
        epochs,
        train_accuracy,
        label="Train Accuracy",
    )

    plt.plot(
        epochs,
        val_accuracy,
        label="Validation Accuracy",
    )

    plt.xlabel(
        "Epoch"
    )

    plt.ylabel(
        "Accuracy"
    )

    plt.title(
        "Phase 38 Training Accuracy"
    )

    plt.legend()

    plt.tight_layout()

    plt.savefig(
        PLOTS_DIR
        / "training_accuracy.png",
        dpi=160,
    )

    plt.close()


def main():
    set_random_seed(
        RANDOM_SEED
    )

    ensure_directories(
        MODELS_DIR,
        OUTPUTS_DIR,
        CHECKPOINTS_DIR,
        PLOTS_DIR,
        METRICS_DIR,
    )

    device = get_device()

    print(
        f"Using device: {device}"
    )

    (
        train_loader,
        val_loader,
        _,
    ) = build_dataloaders()

    print(
        f"Training images: "
        f"{len(train_loader.dataset)}"
    )

    print(
        f"Validation images: "
        f"{len(val_loader.dataset)}"
    )

    print(
        f"Classes: "
        f"{train_loader.dataset.classes}"
    )

    class_weights = (
        calculate_class_weights(
            train_loader.dataset
        )
        .to(
            device
        )
    )

    print(
        "Class weights: "
        f"{class_weights.detach().cpu().tolist()}"
    )

    criterion = nn.CrossEntropyLoss(
        weight=class_weights
    )

    model = build_resnet18()

    model = model.to(
        device
    )

    history = []

    global_best_val_loss = (
        math.inf
    )

    best_checkpoint_path = (
        CHECKPOINTS_DIR
        / "best_resnet18_checkpoint.pth"
    )

    # -----------------------------------------------------
    # STAGE 1 — classifier head
    # -----------------------------------------------------

    print()
    print(
        "========== STAGE 1: TRAIN CLASSIFIER HEAD =========="
    )

    freeze_backbone(
        model
    )

    (
        global_best_val_loss,
        last_epoch,
    ) = train_stage(
        stage_name="head",
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        device=device,
        number_of_epochs=HEAD_EPOCHS,
        learning_rate=HEAD_LEARNING_RATE,
        starting_epoch=0,
        history=history,
        global_best_val_loss=global_best_val_loss,
        global_best_path=best_checkpoint_path,
    )

    # -----------------------------------------------------
    # STAGE 2 — fine tune layer4 + head
    # -----------------------------------------------------

    print()
    print(
        "========== STAGE 2: FINE-TUNE LAYER4 + HEAD =========="
    )

    best_checkpoint = torch.load(
        best_checkpoint_path,
        map_location=device,
        weights_only=False,
    )

    model.load_state_dict(
        best_checkpoint[
            "model_state_dict"
        ]
    )

    unfreeze_layer4_and_head(
        model
    )

    (
        global_best_val_loss,
        last_epoch,
    ) = train_stage(
        stage_name="finetune",
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        device=device,
        number_of_epochs=FINETUNE_EPOCHS,
        learning_rate=FINETUNE_LEARNING_RATE,
        starting_epoch=last_epoch,
        history=history,
        global_best_val_loss=global_best_val_loss,
        global_best_path=best_checkpoint_path,
    )

    # -----------------------------------------------------
    # FINAL BEST MODEL
    # -----------------------------------------------------

    best_checkpoint = torch.load(
        best_checkpoint_path,
        map_location="cpu",
        weights_only=False,
    )

    FINAL_MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    torch.save(
        {
            "architecture":
                "resnet18",

            "task":
                (
                    "brain_mri_4_class_"
                    "classification"
                ),

            "class_names":
                CLASS_NAMES,

            "model_state_dict":
                best_checkpoint[
                    "model_state_dict"
                ],

            "best_validation_loss":
                best_checkpoint[
                    "val_loss"
                ],

            "best_validation_accuracy":
                best_checkpoint[
                    "val_accuracy"
                ],

            "training_stage":
                best_checkpoint[
                    "stage"
                ],

            "epoch":
                best_checkpoint[
                    "epoch"
                ],
        },
        FINAL_MODEL_PATH,
    )

    history_path = (
        METRICS_DIR
        / "training_history.csv"
    )

    save_history_csv(
        history_path,
        history,
    )

    save_json(
        (
            METRICS_DIR
            / "training_summary.json"
        ),
        {
            "architecture":
                "resnet18",

            "classes":
                CLASS_NAMES,

            "device":
                str(
                    device
                ),

            "training_images":
                len(
                    train_loader.dataset
                ),

            "validation_images":
                len(
                    val_loader.dataset
                ),

            "best_validation_loss":
                best_checkpoint[
                    "val_loss"
                ],

            "best_validation_accuracy":
                best_checkpoint[
                    "val_accuracy"
                ],

            "best_epoch":
                best_checkpoint[
                    "epoch"
                ],

            "best_stage":
                best_checkpoint[
                    "stage"
                ],

            "final_model_path":
                str(
                    FINAL_MODEL_PATH
                ),
        },
    )

    plot_training_history(
        history
    )

    print()
    print(
        "========== TRAINING COMPLETE =========="
    )

    print(
        f"Best validation loss: "
        f"{best_checkpoint['val_loss']:.4f}"
    )

    print(
        f"Best validation accuracy: "
        f"{best_checkpoint['val_accuracy']:.4f}"
    )

    print(
        f"Saved final model:"
    )

    print(
        FINAL_MODEL_PATH
    )

    print()
    print(
        "Next:"
    )

    print(
        "python .\\src\\phase38_evaluate.py"
    )


if __name__ == "__main__":
    main()
