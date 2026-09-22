import argparse
import shutil
from pathlib import Path
import kagglehub
from phase37_config import KAGGLE_DATASET_HANDLE, RAW_DATA_DIR

def find_dataset_root(downloaded_path: Path) -> Path:
    candidates = [downloaded_path] + [p for p in downloaded_path.rglob("*") if p.is_dir()]
    for candidate in candidates:
        if (candidate / "Training").is_dir() and (candidate / "Testing").is_dir():
            return candidate
    raise RuntimeError("Could not find a directory containing both Training and Testing.")

def copy_dataset(source_root: Path, destination_root: Path, *, force: bool):
    destination_root.mkdir(parents=True, exist_ok=True)
    existing = [p for p in destination_root.iterdir() if p.name != ".gitkeep"]
    if existing and not force:
        raise RuntimeError("Raw dataset directory is not empty. Use --force to replace it.")
    if force:
        for item in existing:
            shutil.rmtree(item) if item.is_dir() else item.unlink()
    for item in source_root.iterdir():
        dst = destination_root / item.name
        shutil.copytree(item, dst, dirs_exist_ok=True) if item.is_dir() else shutil.copy2(item, dst)

def main():
    parser = argparse.ArgumentParser(description="Download MediVision Phase 37 Brain MRI dataset.")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    print(f"Downloading: {KAGGLE_DATASET_HANDLE}")
    downloaded = Path(kagglehub.dataset_download(KAGGLE_DATASET_HANDLE))
    source_root = find_dataset_root(downloaded)
    print(f"Detected source: {source_root}")
    copy_dataset(source_root, RAW_DATA_DIR, force=args.force)
    print(f"Copied raw dataset to: {RAW_DATA_DIR}")
    print(r"Next: python .\src\validate_dataset.py")

if __name__ == "__main__":
    main()
