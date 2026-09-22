# MediVision AI — Phase 40 Medical Image Screening

Phase 40 connects the completed Phase 38 ResNet18 model and Phase 39 Grad-CAM to the authenticated React + FastAPI application.

## Result

```text
Patient /medical-image
        ↓
JPG / JPEG / PNG
        ↓
Required disclaimer acceptance
        ↓
Authenticated FastAPI endpoint
        ↓
Phase 38 ResNet18
        ↓
4-class prediction
        ↓
Phase 39-style Grad-CAM
        ↓
Persist screening metadata
        ↓
Phase 49 audit event
        ↓
React result UI
```

The UI deliberately uses:

```text
AI-assisted screening result
Possible class
Model score
Grad-CAM visualization
Suggested specialty
Safety message
```

It never uses `Final Diagnosis`.

---

# 1. Existing model reused

The service loads:

```text
C:\Shubham\MediVision\ml\models\brain_mri_resnet18.pth
```

Expected class order:

```text
glioma
meningioma
no_tumor
pituitary
```

The inference preprocessing matches Phase 38 evaluation:

```text
Resize 224 × 224
ToTensor
ImageNet normalization
```

Grad-CAM target:

```text
model.layer4[-1].conv2
```

which corresponds to:

```text
layer4.1.conv2
```

---

# 2. Copy the package

Extract the ZIP into:

```text
C:\Shubham\MediVision
```

It adds new files only.

Do not overwrite your current `main.py`, `AppRoutes.jsx`, or `models/__init__.py` automatically. Apply the small edits below.

---

# 3. Backend dependencies

Open PowerShell:

```powershell
cd C:\Shubham\MediVision\backend
.myenv\Scripts\Activate
```

Install the lightweight dependencies:

```powershell
pip install -r .\requirements-phase40.txt
```

Check whether PyTorch is already available in the backend virtual environment:

```powershell
python -c "import torch, torchvision; print('torch:', torch.__version__); print('torchvision:', torchvision.__version__); print('CUDA:', torch.cuda.is_available())"
```

If that command fails because `torch` / `torchvision` are not installed, install the CPU build:

```powershell
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

Then verify again.

Phase 40 runs inside the FastAPI process, so `.myenv` must contain PyTorch even though `.mlenv` already contains it.

---

# 4. Register the SQLAlchemy model

Edit:

```text
backend\app\models\__init__.py
```

Add without removing existing imports:

```python
from app.models.medical_image_analysis import (
    MedicalImageAnalysis,
)
```

---

# 5. Migration

The included migration assumes your current Phase 49 head is:

```text
9c2f47a1d8e3
```

Check first:

```powershell
alembic current
alembic heads
```

If both show `9c2f47a1d8e3`, run:

```powershell
alembic upgrade head
alembic check
```

Expected new head:

```text
a4c9e12b7f40
```

Verify the table:

```powershell
python -c "from sqlalchemy import inspect; from app.core.database import engine; i=inspect(engine); print('medical_image_analyses:', 'medical_image_analyses' in i.get_table_names()); engine.dispose()"
```

Expected:

```text
medical_image_analyses: True
```

If your Alembic head is NOT `9c2f47a1d8e3`, do not apply the included migration. Delete/copy it aside, register the model, then generate a migration from your current head:

```powershell
alembic revision --autogenerate -m "add medical image analyses"
```

Inspect it, then:

```powershell
alembic upgrade head
alembic check
```

---

# 6. Add the FastAPI router

Edit:

```text
backend\app\main.py
```

Add near the other route imports:

```python
from app.api.routes.medical_image import (
    router as medical_image_router,
)
```

Then near the other newer routers:

```python
app.include_router(
    medical_image_router
)
```

Do NOT add another `prefix="/api/v1"` because this new router already defines:

```text
/api/v1/medical-image
```

---

# 7. Backend syntax verification

Run:

```powershell
python -m py_compile .\app\models\medical_image_analysis.py
python -m py_compile .\app\schemas\medical_image.py
python -m py_compile .\app\repositories\medical_image.py
python -m py_compile .\app\services\medical_image.py
python -m py_compile .\app\api\routes\medical_image.py

python -c "from app.services.medical_image import MODEL_PATH; print(MODEL_PATH); print('exists:', MODEL_PATH.is_file())"
```

Expected:

```text
C:\Shubham\MediVision\ml\models\brain_mri_resnet18.pth
exists: True
```

Verify the model can load from the backend environment:

```powershell
python -c "from app.services.medical_image import get_medical_image_model; m,d=get_medical_image_model(); print('device:', d); print('output classes:', m.fc[-1].out_features)"
```

Expected:

```text
device: cpu
output classes: 4
```

`device: cuda` is also valid when a CUDA-enabled PyTorch build is installed.

---

# 8. Start backend

```powershell
fastapi dev app/main.py
```

Swagger:

```text
http://localhost:8000/docs
```

Phase 40 endpoints:

```text
POST /api/v1/medical-image/screen
GET  /api/v1/medical-image/analyses
```

The POST endpoint requires PATIENT authentication through your existing patient dependency.

---

# 9. Frontend API

The package adds:

```text
frontend\src\features\medicalImage\api\medicalImageApi.js
```

It uses your existing:

```javascript
import {
  apiClient,
} from "@/api/client";
```

so JWT handling remains centralized in the existing Axios client.

The upload request uses `FormData`.

Do not manually set `Content-Type: multipart/form-data`; Axios/browser supplies the correct boundary automatically.

---

# 10. Frontend page

The package adds:

```text
frontend\src\features\medicalImage\pages\MedicalImagePage.jsx
```

---

# 11. Replace the /medical-image placeholder

Edit:

```text
frontend\src\routes\AppRoutes.jsx
```

Add this import near the symptom assessment import:

```jsx
// ======================================================
// PHASE 40 — MEDICAL IMAGE AI
// ======================================================

import MedicalImagePage
  from "@/features/medicalImage/pages/MedicalImagePage";
```

Find the current deferred placeholder:

```jsx
<Route
  path="/medical-image"
  element={
    <PlaceholderPage
      title="Medical Image AI"
      description="AI-assisted medical-image screening."
    />
  }
/>
```

Replace it with:

```jsx
<Route
  path="/medical-image"
  element={
    <MedicalImagePage />
  }
/>
```

Keep it inside the PATIENT role section.

---

# 12. Frontend verification

```powershell
cd C:\Shubham\MediVision\frontend

npm run lint
npm run build
npm run dev
```

Open:

```text
http://localhost:5173/medical-image
```

---

# 13. Test with a known held-out Phase 37 test image

For initial verification, use one of your held-out test images.

Example:

```text
C:\Shubham\MediVision\ml\data\brain_mri\prepared\test\glioma\glioma_00328.jpg
```

In the UI:

```text
1. Choose the MRI image.
2. Accept the disclaimer.
3. Click "Run AI-assisted Screening".
4. Wait for CPU inference + Grad-CAM.
5. Verify result UI appears.
```

The result should contain:

```text
AI-assisted screening result
Possible class
Model score
Grad-CAM overlay
Four class scores
Suggested specialty
Safety message
```

The exact class/model score depends on the image.

---

# 14. Persistence

Phase 40 stores screening metadata in:

```text
medical_image_analyses
```

Stored:

```text
patient_id
filename
MIME type
file size
predicted class
display label
model score
all four class scores
suggested specialty
model/version
Grad-CAM target layer
disclaimer accepted
timestamp
```

Not stored:

```text
raw uploaded MRI bytes
base64 Grad-CAM overlay
JWT
password
API key
```

The original uploaded image is processed in memory and is not written to disk by this Phase 40 implementation.

The Grad-CAM image is returned only to the current frontend response.

---

# 15. Audit logging

After a successful persisted screening, Phase 40 emits:

```text
IMAGE_ANALYSIS_CREATED
```

Resource type:

```text
IMAGE_ANALYSIS
```

Audit metadata is intentionally limited to:

```text
model
target_layer
```

The audit log does not store the MRI bytes, class result, full patient data, JWT or other secrets.

---

# 16. Safety wording

Correct:

```text
AI-assisted screening result
Possible class
Model score
Grad-CAM visualization
Suggested specialty
```

Avoid:

```text
Final Diagnosis
Confirmed Tumor
100% disease probability
Grad-CAM proves tumor location
AI doctor diagnosis
```

A model score such as `100.00%` is a softmax classifier output and must not be interpreted as `100% probability that the patient has the disease`.

---

# 17. Phase 40 completion checklist

```text
[ ] backend .myenv has torch + torchvision
[ ] medical_image_analyses migration applied
[ ] model path exists
[ ] model loads in backend
[ ] medical_image_router added to main.py
[ ] /medical-image placeholder replaced
[ ] frontend lint passes
[ ] frontend build passes
[ ] patient can upload JPG/PNG
[ ] disclaimer required
[ ] unsupported/large files rejected
[ ] ResNet18 classification returned
[ ] model score displayed
[ ] Grad-CAM overlay displayed
[ ] safety message displayed
[ ] specialty displayed
[ ] metadata row saved
[ ] IMAGE_ANALYSIS_CREATED audit row saved
[ ] UI never says "Final Diagnosis"
```

When all checks pass:

```text
Phase 37 — Dataset                  COMPLETE
Phase 38 — ResNet18                 COMPLETE
Phase 39 — Grad-CAM                 COMPLETE
Phase 40 — Medical Image UI/API     COMPLETE
```
