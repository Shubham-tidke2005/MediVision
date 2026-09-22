from pathlib import Path

ML_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = ML_DIR / "models" / "brain_mri_resnet18.pth"
TEST_DATA_DIR = ML_DIR / "data" / "brain_mri" / "prepared" / "test"
OUTPUTS_DIR = ML_DIR / "outputs" / "phase39"
EXAMPLES_DIR = OUTPUTS_DIR / "examples"
TARGET_LAYER_NAME = "layer4.1.conv2"
HEATMAP_ALPHA = 0.45
DEFAULT_RANDOM_SEED = 42
