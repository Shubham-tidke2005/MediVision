# AI / ML Overview

MediVision uses AI in two main areas:

```text
1. AI-assisted symptom assessment
2. Brain MRI image classification
```

## Symptom AI

Flow:

```text
Symptoms
 ↓
Canonical catalog
 ↓
Structured OpenAI request
 ↓
Possible conditions
 ↓
Specialty
 ↓
Urgency / red flags
```

The output is decision support only.

## Computer Vision

```text
Brain MRI
 ↓
ResNet18
 ↓
4-class classification
 ↓
Model score
 ↓
Grad-CAM
```

The output is screening/classification, not diagnosis.
