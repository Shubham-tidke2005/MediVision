# ResNet18 Training & Results

Architecture:

```text
ResNet18
ImageNet transfer learning
```

Head:

```text
Dropout(0.30)
Linear(512 → 4)
```

Input:

```text
224 × 224 RGB
ImageNet normalization
```

Training:

```text
Stage 1: train classifier head
Stage 2: fine-tune layer4 + head
```

Best checkpoint:

```text
selected by validation loss
```

Held-out test metrics:

```text
Accuracy:        94.19%
Macro Precision: 94.32%
Macro Recall:    94.10%
Macro F1:        94.06%
```

Recall:

```text
Glioma:          83.42%
Meningioma:      94.72%
No Tumor:        99.75%
Pituitary Tumor: 98.50%
```

Confusion matrix:

```text
[[322, 38, 24,  2],
 [ 12,377,  3,  6],
 [  0,  1,399,  0],
 [  2,  3,  1,394]]
```

These are dataset classification metrics, not clinical diagnostic validation.
