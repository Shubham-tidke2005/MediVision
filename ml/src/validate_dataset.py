import csv
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image
from phase37_config import CLASS_ALIASES, CLASS_NAMES, EXPECTED_SOURCE_SPLITS, RAW_DATA_DIR, REPORTS_DIR, SUPPORTED_IMAGE_EXTENSIONS

def normalize_class_name(name: str):
    return CLASS_ALIASES.get(name.strip().lower())

def get_images(folder: Path):
    return sorted(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS)

def sha256_file(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def dhash(path: Path):
    with Image.open(path) as image:
        image = image.convert("L").resize((9, 8))
        pixels = list(image.getdata())
    value = 0
    bit = 0
    for row in range(8):
        start = row * 9
        for col in range(8):
            if pixels[start + col] > pixels[start + col + 1]:
                value |= 1 << bit
            bit += 1
    return value

def hamming(a: int, b: int):
    return (a ^ b).bit_count()

class BKNode:
    def __init__(self, value, item):
        self.value = value
        self.items = [item]
        self.children = {}

class BKTree:
    def __init__(self):
        self.root = None
    def add(self, value, item):
        if self.root is None:
            self.root = BKNode(value, item); return
        node = self.root
        while True:
            d = hamming(value, node.value)
            if d == 0:
                node.items.append(item); return
            child = node.children.get(d)
            if child is None:
                node.children[d] = BKNode(value, item); return
            node = child
    def search(self, value, threshold):
        if self.root is None: return []
        out, stack = [], [self.root]
        while stack:
            node = stack.pop()
            d = hamming(value, node.value)
            if d <= threshold:
                out.extend((d, item) for item in node.items)
            lo, hi = d - threshold, d + threshold
            stack.extend(child for edge, child in node.children.items() if lo <= edge <= hi)
        return out

def write_csv(path: Path, rows, fieldnames):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames); w.writeheader(); w.writerows(rows)

def main():
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    for split in EXPECTED_SOURCE_SPLITS:
        if not (RAW_DATA_DIR / split).is_dir():
            raise RuntimeError(f"Missing required split: {RAW_DATA_DIR / split}")
    records, invalid_folders = [], []
    for split in EXPECTED_SOURCE_SPLITS:
        for class_folder in sorted(p for p in (RAW_DATA_DIR / split).iterdir() if p.is_dir()):
            canonical = normalize_class_name(class_folder.name)
            if canonical is None:
                invalid_folders.append(str(class_folder)); continue
            for path in get_images(class_folder):
                records.append({
                    "source_split": split, "source_class": class_folder.name,
                    "canonical_class": canonical, "path": path,
                    "relative_path": str(path.relative_to(RAW_DATA_DIR)),
                })
    if not records:
        raise RuntimeError("No supported image files found.")
    valid, corrupt, dimensions = [], [], Counter()
    for i, rec in enumerate(records, 1):
        try:
            with Image.open(rec["path"]) as im: im.verify()
            with Image.open(rec["path"]) as im: w, h = im.size
            rec.update(width=w, height=h, sha256=sha256_file(rec["path"]), dhash=dhash(rec["path"]))
            dimensions[(w, h)] += 1; valid.append(rec)
        except Exception as exc:
            corrupt.append({"path": rec["relative_path"], "error": str(exc)})
        if i % 500 == 0: print(f"Inspected {i}/{len(records)} images...")
    class_counts, split_counts, class_split_counts = Counter(), Counter(), Counter()
    for r in valid:
        class_counts[r["canonical_class"]] += 1
        split_counts[r["source_split"]] += 1
        class_split_counts[(r["source_split"], r["canonical_class"])] += 1
    by_hash = defaultdict(list)
    for r in valid: by_hash[r["sha256"]].append(r)
    exact_groups = []
    for digest, group in by_hash.items():
        if len(group) <= 1: continue
        splits = sorted({r["source_split"] for r in group}); classes = sorted({r["canonical_class"] for r in group})
        exact_groups.append({
            "sha256": digest, "count": len(group), "cross_split": len(splits) > 1,
            "cross_class": len(classes) > 1, "splits": splits, "classes": classes,
            "paths": [r["relative_path"] for r in group],
        })
    tree = BKTree()
    for r in valid:
        if r["source_split"] == "Training": tree.add(r["dhash"], r)
    near = []
    testing = [r for r in valid if r["source_split"] == "Testing"]
    for i, test in enumerate(testing, 1):
        for distance, train in tree.search(test["dhash"], 4):
            near.append({
                "hamming_distance": distance,
                "same_class": train["canonical_class"] == test["canonical_class"],
                "training_path": train["relative_path"], "training_class": train["canonical_class"],
                "testing_path": test["relative_path"], "testing_class": test["canonical_class"],
            })
        if i % 250 == 0: print(f"Near-duplicate scan: {i}/{len(testing)} Testing images...")
    cross_split_exact = [g for g in exact_groups if g["cross_split"]]
    cross_class_exact = [g for g in exact_groups if g["cross_class"]]
    summary = {
        "raw_dataset_directory": str(RAW_DATA_DIR), "total_candidate_images": len(records),
        "valid_images": len(valid), "corrupt_images": len(corrupt),
        "invalid_class_folders": invalid_folders,
        "missing_canonical_classes": [c for c in CLASS_NAMES if class_counts[c] == 0],
        "class_counts": {c: class_counts[c] for c in CLASS_NAMES},
        "split_counts": dict(split_counts),
        "class_split_counts": {f"{s}/{c}": class_split_counts[(s,c)] for s in EXPECTED_SOURCE_SPLITS for c in CLASS_NAMES},
        "unique_dimensions": len(dimensions),
        "most_common_dimensions": [{"width": w, "height": h, "count": n} for (w,h),n in dimensions.most_common(20)],
        "exact_duplicate_groups": len(exact_groups),
        "cross_split_exact_duplicate_groups": len(cross_split_exact),
        "cross_class_exact_duplicate_groups": len(cross_class_exact),
        "cross_split_near_duplicate_candidates": len(near),
        "near_duplicate_dhash_threshold": 4,
    }
    (REPORTS_DIR / "phase37_dataset_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    write_csv(REPORTS_DIR / "phase37_corrupt_images.csv", corrupt, ["path", "error"])
    exact_rows = []
    for idx, g in enumerate(exact_groups, 1):
        for p in g["paths"]:
            exact_rows.append({
                "group": idx, "sha256": g["sha256"], "cross_split": g["cross_split"],
                "cross_class": g["cross_class"], "splits": "|".join(g["splits"]),
                "classes": "|".join(g["classes"]), "path": p,
            })
    write_csv(REPORTS_DIR / "phase37_exact_duplicates.csv", exact_rows, ["group","sha256","cross_split","cross_class","splits","classes","path"])
    write_csv(REPORTS_DIR / "phase37_near_duplicates.csv", near, ["hamming_distance","same_class","training_path","training_class","testing_path","testing_class"])
    print("\n========== PHASE 37 DATASET SUMMARY ==========")
    print(f"Valid images: {len(valid)}")
    print(f"Corrupt images: {len(corrupt)}")
    for c in CLASS_NAMES: print(f"{c}: {class_counts[c]}")
    print(f"Training: {split_counts['Training']}")
    print(f"Testing: {split_counts['Testing']}")
    print(f"Exact duplicate groups: {len(exact_groups)}")
    print(f"Cross-split exact duplicate groups: {len(cross_split_exact)}")
    print(f"Cross-class exact duplicate groups: {len(cross_class_exact)}")
    print(f"Cross-split near-duplicate candidates: {len(near)}")
    print(f"Reports: {REPORTS_DIR}")
    if corrupt or invalid_folders or summary["missing_canonical_classes"] or cross_class_exact:
        print("RESULT: REVIEW REQUIRED")
    else:
        print("RESULT: STRUCTURE VALID")
        if cross_split_exact or near:
            print("Review duplicate reports before Phase 38.")

if __name__ == "__main__":
    main()
