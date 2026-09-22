from pathlib import Path


# =========================================================
# PATHS
# =========================================================

ML_DIR = Path(__file__).resolve().parents[1]

PREPARED_DATA_DIR = (
    ML_DIR
    / "data"
    / "brain_mri"
    / "prepared"
)

MODELS_DIR = (
    ML_DIR
    / "models"
)

OUTPUTS_DIR = (
    ML_DIR
    / "outputs"
    / "phase38"
)

CHECKPOINTS_DIR = (
    OUTPUTS_DIR
    / "checkpoints"
)

PLOTS_DIR = (
    OUTPUTS_DIR
    / "plots"
)

METRICS_DIR = (
    OUTPUTS_DIR
    / "metrics"
)

FINAL_MODEL_PATH = (
    MODELS_DIR
    / "brain_mri_resnet18.pth"
)


# =========================================================
# DATA
# =========================================================

CLASS_NAMES = [
    "glioma",
    "meningioma",
    "no_tumor",
    "pituitary",
]

DISPLAY_NAMES = {
    "glioma":
        "Glioma",

    "meningioma":
        "Meningioma",

    "no_tumor":
        "No Tumor",

    "pituitary":
        "Pituitary Tumor",
}

NUM_CLASSES = len(
    CLASS_NAMES
)

IMAGE_SIZE = 224


# =========================================================
# TRAINING
# =========================================================

RANDOM_SEED = 42

BATCH_SIZE = 32

NUM_WORKERS = 0

PIN_MEMORY = True

HEAD_EPOCHS = 5

FINETUNE_EPOCHS = 15

HEAD_LEARNING_RATE = 1e-3

FINETUNE_LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

EARLY_STOPPING_PATIENCE = 5

SCHEDULER_FACTOR = 0.5

SCHEDULER_PATIENCE = 2


# =========================================================
# MODEL
# =========================================================

USE_PRETRAINED_WEIGHTS = True

DROPOUT = 0.30
