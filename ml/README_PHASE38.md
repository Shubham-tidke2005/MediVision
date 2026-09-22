# MediVision AI — Phase 38

## Goal

Train one PyTorch deep-learning model for:

**4-class Brain MRI image classification**

Classes:

```text
glioma
meningioma
no_tumor
pituitary
```

Model:

**ResNet18 using transfer learning**

This is an academic AI-assisted medical-image
classification component. It is not a clinical diagnosis system.

---

## Input expected from Phase 37

Phase 38 expects:

```text
C:\Shubham\MediVision\ml\data\brain_mri\prepared
├── train
│   ├── glioma
│   ├── meningioma
│   ├── no_tumor
│   └── pituitary
├── val
│   ├── glioma
│   ├── meningioma
│   ├── no_tumor
│   └── pituitary
└── test
    ├── glioma
    ├── meningioma
    ├── no_tumor
    └── pituitary
```

For the user's current prepared dataset:

```text
Train:      4615
Validation: 814
Test:       1584
Total:      7013
```

---

## Files

```text
ml/
├── requirements.txt
├── README_PHASE38.md
│
├── models/
│   └── brain_mri_resnet18.pth
│
├── outputs/
│   └── phase38/
│       ├── checkpoints/
│       ├── metrics/
│       └── plots/
│
└── src/
    ├── phase38_config.py
    ├── phase38_utils.py
    ├── phase38_transforms.py
    ├── phase38_dataset.py
    ├── phase38_model.py
    ├── phase38_train.py
    └── phase38_evaluate.py
```

The model and output folders are created automatically.

---

## 1. Activate the ML environment

```powershell
cd C:\Shubham\MediVision\ml

.mlenv\Scripts\Activate
```

Update/install dependencies:

```powershell
python -m pip install --upgrade pip

pip install -r requirements.txt
```

Check PyTorch:

```powershell
python -c "import torch, torchvision; print('torch:', torch.__version__); print('torchvision:', torchvision.__version__); print('CUDA available:', torch.cuda.is_available())"
```

If CUDA is available, training will use the GPU.

If CUDA is not available, training still works on CPU but will take
much longer.

---

## 2. Verify imports

```powershell
python -m py_compile .\src\phase38_config.py
python -m py_compile .\src\phase38_utils.py
python -m py_compile .\src\phase38_transforms.py
python -m py_compile .\src\phase38_dataset.py
python -m py_compile .\src\phase38_model.py
python -m py_compile .\src\phase38_train.py
python -m py_compile .\src\phase38_evaluate.py
```

Verify prepared data:

```powershell
python -c "import sys; sys.path.insert(0, r'.\src'); from phase38_dataset import build_datasets; a,b,c=build_datasets(); print('train:',len(a)); print('val:',len(b)); print('test:',len(c)); print('classes:',a.classes)"
```

Expected classes:

```text
['glioma', 'meningioma', 'no_tumor', 'pituitary']
```

---

## 3. Training pipeline

The code implements:

```text
Brain MRI
   ↓
Resize 224 × 224
   ↓
Conservative augmentation (train only)
   ↓
ImageNet normalization
   ↓
ResNet18 pretrained on ImageNet
   ↓
Stage 1: train classifier head
   ↓
Stage 2: fine-tune layer4 + classifier head
   ↓
Validation monitoring
   ↓
Early stopping
   ↓
Best model
```

### Training augmentation

Training only:

- resize 224 × 224,
- rotation up to ±8 degrees,
- small translation,
- small scale change,
- minor brightness/contrast variation,
- ImageNet normalization.

Validation and test:

- resize 224 × 224,
- ImageNet normalization,
- no random augmentation.

---

## 4. Train

Run:

```powershell
python .\src\phase38_train.py
```

The first run may download pretrained ResNet18 ImageNet weights.

Default settings:

```text
Batch size:                 32
Head training epochs:        5
Fine-tuning epochs:         15
Head learning rate:       1e-3
Fine-tune learning rate:  1e-4
Weight decay:             1e-4
Early stopping patience:     5
Random seed:                42
```

The training code uses weighted cross-entropy because Phase 37's
duplicate cleanup leaves mild class imbalance.

### Stage 1

The pretrained ResNet18 backbone is frozen.

Only the new classifier head is trained.

### Stage 2

The best model from Stage 1 is loaded.

Then:

```text
layer4
+
classifier head
```

are fine-tuned using a smaller learning rate.

This gives stronger academic value than using ResNet18 only as a
fixed feature extractor.

---

## 5. Final model

The best validation checkpoint is saved as:

```text
C:\Shubham\MediVision\ml\models\brain_mri_resnet18.pth
```

This `.pth` file contains:

```text
architecture
task
class_names
model_state_dict
best_validation_loss
best_validation_accuracy
training_stage
epoch
```

Keep this file for:

- Phase 39 Grad-CAM
- Phase 40 FastAPI inference

---

## 6. Evaluate exactly once on the held-out test set

After training finishes:

```powershell
python .\src\phase38_evaluate.py
```

Phase 38 evaluates:

- Accuracy
- Macro Precision
- Macro Recall
- Macro F1-score
- Confusion Matrix
- Class-wise Recall
- Full classification report

The test set is not used by the training loop.

---

## 7. Output files

### Model

```text
ml\models\brain_mri_resnet18.pth
```

### Training history

```text
ml\outputs\phase38\metrics\training_history.csv
ml\outputs\phase38\metrics\training_summary.json
```

### Test results

```text
ml\outputs\phase38\metrics\test_metrics.json
ml\outputs\phase38\metrics\classification_report.txt
```

### Plots

```text
ml\outputs\phase38\plots\training_loss.png
ml\outputs\phase38\plots\training_accuracy.png
ml\outputs\phase38\plots\confusion_matrix.png
```

### Checkpoints

```text
ml\outputs\phase38\checkpoints\
```

---

## 8. Important interpretation

Do not describe test accuracy as clinical accuracy.

For the project report, write:

> The model was evaluated on the held-out test portion of the selected
> public Brain MRI dataset. The reported metrics describe performance
> on this dataset and do not establish real-world diagnostic
> performance.

Likewise, a model softmax score should later be shown as a
**model score**, not as the probability that a patient has a disease.

---

## 9. Suggested report table

After `phase38_evaluate.py`, use the actual generated values:

```text
Metric                  Result
--------------------------------
Accuracy                ...
Macro Precision         ...
Macro Recall            ...
Macro F1-score           ...

Class-wise Recall
--------------------------------
Glioma                  ...
Meningioma              ...
No Tumor                ...
Pituitary Tumor         ...
```

Do not invent results before training.

---

## 10. Phase 38 completion criteria

Phase 38 is complete when:

```text
[ ] PyTorch environment works
[ ] ResNet18 pretrained weights load
[ ] Training completes
[ ] Validation best model is selected
[ ] brain_mri_resnet18.pth exists
[ ] Held-out test evaluation runs
[ ] Accuracy recorded
[ ] Precision recorded
[ ] Recall recorded
[ ] F1-score recorded
[ ] Confusion matrix generated
[ ] Class-wise recall recorded
[ ] Training loss/accuracy plots generated
```

Then move to:

**Phase 39 — Grad-CAM**

Do not build the medical-image upload API/UI until the trained model
has been evaluated and its class mapping is fixed.
