# MediVision AI — Phase 39 Grad-CAM

## Goal

Add explainable Computer Vision to the trained Phase 38 model using **Grad-CAM (Gradient-weighted Class Activation Mapping)**.

```text
Brain MRI
   ↓
ResNet18
   ↓
Predicted class
   ↓
Gradients of selected class
   ↓
Final convolution feature maps
   ↓
Grad-CAM
   ↓
Heatmap + overlay
```

Grad-CAM shows which image regions influenced the CNN output. It is a **model visualization**, not proof of disease, lesion location, or a clinical diagnosis.

## Prerequisite

Phase 38 must already be complete and this file must exist:

```text
C:\Shubham\MediVision\ml\models\brain_mri_resnet18.pth
```

## New files

```text
ml/
├── README_PHASE39.md
├── outputs/
│   └── phase39/
│       └── examples/
└── src/
    ├── phase39_config.py
    ├── phase39_model.py
    ├── phase39_gradcam.py
    ├── phase39_visualize.py
    ├── phase39_run.py
    ├── phase39_generate_examples.py
    └── phase39_verify.py
```

No new package is required beyond your existing Phase 38 environment.

## 1. Activate the environment

```powershell
cd C:\Shubham\MediVision\ml
.mlenv\Scripts\Activate
```

## 2. Syntax check

```powershell
python -m py_compile .\src\phase39_config.py
python -m py_compile .\src\phase39_model.py
python -m py_compile .\src\phase39_gradcam.py
python -m py_compile .\src\phase39_visualize.py
python -m py_compile .\src\phase39_run.py
python -m py_compile .\src\phase39_generate_examples.py
python -m py_compile .\src\phase39_verify.py
```

## 3. Verify the Phase 38 model

```powershell
python .\src\phase39_verify.py
```

Expected shape:

```text
Model output shape: (1, 4)
Phase 39 model verification OK.
```

The Grad-CAM target layer is:

```text
layer4.1.conv2
```

which corresponds to:

```python
model.layer4[-1].conv2
```

This is the final convolution in ResNet18's last residual block.

## 4. Generate Grad-CAM for one MRI

Choose one test image and run:

```powershell
python .\src\phase39_run.py `
  --image ".\data\brain_mri\prepared\test\glioma\YOUR_IMAGE.jpg"
```

The script prints:

```text
Prediction: ...
Model score: ...
Grad-CAM target: ...
Class scores: ...
```

It creates:

```text
original.png
heatmap.png
gradcam_overlay.png
gradcam_summary.png
result.json
```

under:

```text
ml\outputs\phase39\examples\...
```

## 5. Generate one example from every class

```powershell
python .\src\phase39_generate_examples.py
```

Generate three per class:

```powershell
python .\src\phase39_generate_examples.py --per-class 3
```

## 6. Optional target-class explanation

By default Grad-CAM explains the predicted class. You can explicitly choose a class for academic analysis:

```powershell
python .\src\phase39_run.py `
  --image ".\data\brain_mri\prepared\test\glioma\YOUR_IMAGE.jpg" `
  --target-class glioma
```

Supported classes:

```text
glioma
meningioma
no_tumor
pituitary
```

## 7. Model score wording

Correct:

```text
The model assigned a 94.2% softmax score to the Glioma class.
```

Do not write:

```text
The patient has a 94.2% probability of glioma.
```

The softmax output is a model score, not a calibrated clinical disease probability.

## 8. Viva explanation

Simple explanation:

> Grad-CAM is an explainable AI technique for CNNs. It calculates the gradient of a selected class score with respect to the final convolutional feature maps. The gradients indicate which feature maps were important. These importance weights are combined with the feature maps to generate a heatmap showing which image regions most influenced the prediction.

Conceptually:

```text
1. Compute gradients:
   ∂yᶜ / ∂Aᵏ

2. Average gradients spatially:
   αᶜₖ = average(∂yᶜ / ∂Aᵏ)

3. Combine feature maps:
   Lᶜ = ReLU(Σ αᶜₖ Aᵏ)
```

Where:

```text
yᶜ = score for class c
Aᵏ = convolution feature map k
αᶜₖ = importance weight
Lᶜ = Grad-CAM heatmap
```

## 9. Medical interpretation

Use:

> Grad-CAM highlights image regions that influenced the CNN classification output.

Do not claim:

```text
Grad-CAM proves the tumor is here.
Grad-CAM gives the exact tumor boundary.
The highlighted region confirms disease.
```

Grad-CAM is not a segmentation method and is not clinical evidence.

## 10. Phase 39 completion checklist

```text
[ ] Phase 38 model loads
[ ] layer4.1.conv2 target layer verified
[ ] Gradients captured
[ ] Feature maps captured
[ ] Heatmap generated
[ ] Overlay generated
[ ] At least one example per class inspected
[ ] Model score wording used correctly
[ ] Safety notice included
[ ] Report/viva summary images generated
```

After this, move to **Phase 40 — FastAPI Medical Image Screening + React UI**.
