from pathlib import Path

ML_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ML_DIR / "data" / "brain_mri"
RAW_DATA_DIR = DATA_DIR / "raw"
PREPARED_DATA_DIR = DATA_DIR / "prepared"
REPORTS_DIR = ML_DIR / "reports"

KAGGLE_DATASET_HANDLE = "masoudnickparvar/brain-tumor-mri-dataset"
EXPECTED_SOURCE_SPLITS = ("Training", "Testing")

CLASS_NAMES = ("glioma", "meningioma", "no_tumor", "pituitary")
DISPLAY_NAMES = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "no_tumor": "No Tumor",
    "pituitary": "Pituitary Tumor",
}

CLASS_ALIASES = {
    "glioma": "glioma",
    "glioma_tumor": "glioma",
    "meningioma": "meningioma",
    "meningioma_tumor": "meningioma",
    "notumor": "no_tumor",
    "no_tumor": "no_tumor",
    "no-tumor": "no_tumor",
    "no tumor": "no_tumor",
    "pituitary": "pituitary",
    "pituitary_tumor": "pituitary",
}

SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MODEL_INPUT_SIZE = (224, 224)
