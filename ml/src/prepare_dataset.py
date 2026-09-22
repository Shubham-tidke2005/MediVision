import argparse
import csv
import hashlib
import random
import shutil
from collections import defaultdict
from pathlib import Path
from phase37_config import CLASS_ALIASES, CLASS_NAMES, PREPARED_DATA_DIR, RAW_DATA_DIR, REPORTS_DIR, SUPPORTED_IMAGE_EXTENSIONS

def normalize(name): return CLASS_ALIASES.get(name.strip().lower())
def sha256_file(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""): h.update(chunk)
    return h.hexdigest()

def collect():
    source = {"Training": defaultdict(list), "Testing": defaultdict(list)}
    for split in ("Training", "Testing"):
        root = RAW_DATA_DIR / split
        if not root.is_dir(): raise RuntimeError(f"Missing source split: {root}")
        for folder in root.iterdir():
            if not folder.is_dir(): continue
            cls = normalize(folder.name)
            if cls is None: continue
            source[split][cls].extend(sorted(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS))
    for cls in CLASS_NAMES:
        if not source["Training"][cls]: raise RuntimeError(f"No Training images for {cls}")
        if not source["Testing"][cls]: raise RuntimeError(f"No Testing images for {cls}")
    return source

def unique(images):
    seen, kept, removed = {}, [], []
    for path in images:
        digest = sha256_file(path)
        if digest in seen:
            removed.append({"duplicate": str(path.relative_to(RAW_DATA_DIR)), "kept": str(seen[digest].relative_to(RAW_DATA_DIR)), "sha256": digest})
        else:
            seen[digest] = path; kept.append(path)
    return kept, removed

def reset(force):
    PREPARED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    existing = [p for p in PREPARED_DATA_DIR.iterdir() if p.name != ".gitkeep"]
    if existing and not force: raise RuntimeError("Prepared directory is not empty. Use --force to rebuild.")
    if force:
        for p in existing: shutil.rmtree(p) if p.is_dir() else p.unlink()

def copy_image(src, split, cls, index):
    dst_dir = PREPARED_DATA_DIR / split / cls
    dst_dir.mkdir(parents=True, exist_ok=True)
    dst = dst_dir / f"{cls}_{index:05d}{src.suffix.lower()}"
    shutil.copy2(src, dst); return dst

def main():
    parser = argparse.ArgumentParser(description="Prepare canonical Phase 37 train/val/test folders.")
    parser.add_argument("--val-fraction", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    if not 0.05 <= args.val_fraction <= 0.40: raise ValueError("--val-fraction must be between 0.05 and 0.40")
    reset(args.force); source = collect(); rng = random.Random(args.seed)
    manifest, removed = [], []
    test_by_class, test_hashes = {}, set()
    for cls in CLASS_NAMES:
        test_unique, test_removed = unique(source["Testing"][cls]); test_by_class[cls] = test_unique
        removed.extend({**r, "scope": f"Testing/{cls}"} for r in test_removed)
        test_hashes.update(sha256_file(p) for p in test_unique)
    train_val = {}
    for cls in CLASS_NAMES:
        train_unique, train_removed = unique(source["Training"][cls])
        removed.extend({**r, "scope": f"Training/{cls}"} for r in train_removed)
        filtered = []
        for p in train_unique:
            digest = sha256_file(p)
            if digest in test_hashes:
                removed.append({"duplicate": str(p.relative_to(RAW_DATA_DIR)), "kept": "Testing representative", "sha256": digest, "scope": "cross_split_removed"})
            else:
                filtered.append(p)
        rng.shuffle(filtered)
        n_val = max(1, round(len(filtered) * args.val_fraction))
        train_val[cls] = {"val": filtered[:n_val], "train": filtered[n_val:]}
    for cls in CLASS_NAMES:
        for split, images in {"train": train_val[cls]["train"], "val": train_val[cls]["val"], "test": test_by_class[cls]}.items():
            for i, src in enumerate(images, 1):
                dst = copy_image(src, split, cls, i)
                manifest.append({"split": split, "class_name": cls, "source_path": str(src.relative_to(RAW_DATA_DIR)), "prepared_path": str(dst.relative_to(PREPARED_DATA_DIR)), "sha256": sha256_file(src)})
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    with (REPORTS_DIR / "phase37_prepared_manifest.csv").open("w", newline="", encoding="utf-8") as f:
        w=csv.DictWriter(f, fieldnames=["split","class_name","source_path","prepared_path","sha256"]); w.writeheader(); w.writerows(manifest)
    with (REPORTS_DIR / "phase37_removed_exact_duplicates.csv").open("w", newline="", encoding="utf-8") as f:
        w=csv.DictWriter(f, fieldnames=["scope","duplicate","kept","sha256"]); w.writeheader(); w.writerows(removed)
    counts = defaultdict(int)
    for r in manifest: counts[(r["split"],r["class_name"])] += 1
    print("\n========== PREPARED DATASET ==========")
    for split in ("train","val","test"):
        print(split.upper()); total=0
        for cls in CLASS_NAMES:
            n=counts[(split,cls)]; total+=n; print(f"  {cls}: {n}")
        print(f"  TOTAL: {total}")
    print(f"\nPrepared dataset: {PREPARED_DATA_DIR}")
    print(f"Manifest: {REPORTS_DIR / 'phase37_prepared_manifest.csv'}")
    print("Phase 37 preparation complete.")

if __name__ == "__main__":
    main()
