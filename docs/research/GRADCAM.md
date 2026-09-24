# Grad-CAM Research

Target layer:

```text
layer4.1.conv2
```

Flow:

```text
MRI
 ↓
ResNet18
 ↓
Target class logit
 ↓
Backward gradient
 ↓
Feature maps
 ↓
Gradient weights
 ↓
Weighted activation
 ↓
ReLU
 ↓
Upsampled heatmap
 ↓
Overlay
```

Grad-CAM indicates regions that influenced the model.

It is not:

```text
tumor segmentation
lesion boundary
proof of disease
confirmed localization
```

Verified across all four classes.

Generated artifacts include:

```text
original.png
heatmap.png
gradcam_overlay.png
gradcam_summary.png
result.json
```
