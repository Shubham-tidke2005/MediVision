# MediVision AI — Phase 37

## Scope

Use exactly one Computer Vision problem: **4-class Brain MRI classification**.

Classes:

- Glioma
- Meningioma
- Pituitary Tumor
- No Tumor

Internal labels:

```text
glioma
meningioma
pituitary
no_tumor
```

This is an **AI-assisted medical-image screening/classification** research feature, not a clinical diagnosis system.

## Selected dataset

Kaggle handle:

```text
masoudnickparvar/brain-tumor-mri-dataset
```

Expected source structure:

```text
raw/
├── Training/
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
└── Testing/
    ├── glioma/
    ├── meningioma/
    ├── notumor/
    └── pituitary/
```

`notumor` is normalized to `no_tumor`.

## Install

```powershell
cd C:\Shubham\MediVision\ml
py -3.11 -m venv .mlenv
.mlenv\Scripts\Activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Download

```powershell
python .\src\download_dataset.py
```

If Kaggle requires authentication, configure it locally. Never commit Kaggle credentials.

Manual download is also fine; the final raw folders must be:

```text
C:\Shubham\MediVision\ml\data\brain_mri\raw\Training
C:\Shubham\MediVision\ml\data\brain_mri\raw\Testing
```

## Validate

```powershell
python .\src\validate_dataset.py
```

It checks:

- Training/Testing structure
- the four classes
- supported JPG/JPEG/PNG files
- corrupt images
- dimensions
- exact SHA-256 duplicates
- exact duplicates crossing Training/Testing
- cross-class exact duplicates
- perceptual near-duplicate candidates crossing Training/Testing

Reports:

```text
ml\reports\phase37_dataset_summary.json
ml\reports\phase37_corrupt_images.csv
ml\reports\phase37_exact_duplicates.csv
ml\reports\phase37_near_duplicates.csv
```

Near-duplicate candidates are for manual review and are not automatically deleted.

## Prepare canonical data

After reviewing validation reports:

```powershell
python .\src\prepare_dataset.py
```

The script preserves the source `Testing` folder as the held-out test set and splits only source `Training` into `train` and `val`. It removes exact byte duplicates and prevents exact Training duplicates from also appearing in the final test set.

Output:

```text
prepared/
├── train/{glioma,meningioma,no_tumor,pituitary}
├── val/{glioma,meningioma,no_tumor,pituitary}
└── test/{glioma,meningioma,no_tumor,pituitary}
```

The default validation fraction is 15% of source Training with deterministic seed 42.

Rebuild:

```powershell
python .\src\prepare_dataset.py --force
```

## Important limitation

Public image datasets may not provide reliable patient IDs, so image-level splitting cannot prove patient-level independence. The duplicate checks reduce obvious leakage but do not replace patient-level splitting. State this limitation in the report.

## Phase 37 is complete when

- dataset downloaded
- four classes verified
- corrupt images reviewed
- duplicate reports reviewed
- canonical train/val/test folders prepared
- manifest saved
- dataset source and license recorded

Then move to **Phase 38 — ResNet18 transfer learning**.
