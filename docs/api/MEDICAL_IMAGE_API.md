# Medical Image Screening API

## Screen

```http
POST /api/v1/medical-image/screen
```

Request:

```text
multipart/form-data
```

Fields:

```text
image
disclaimer_accepted
```

Supported formats:

```text
.jpg
.jpeg
.png
```

## Processing

```text
Upload
 ↓
File validation
 ↓
PyTorch ResNet18
 ↓
4-class classification
 ↓
Model score
 ↓
Grad-CAM
 ↓
Safety-aware response
```

## Output

```text
possible class
model score
class scores
Grad-CAM image
suggested specialty
safety message
```

Never label this:

```text
Final Diagnosis
```

## History

```http
GET /api/v1/medical-image/analyses
```
