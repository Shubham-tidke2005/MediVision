<div align="center">

# 🩺 MediVision AI

### AI-assisted Healthcare Support & Diagnostic Decision-Support Platform

**Predict • Prevent • Monitor • Recover**

**SPPU Final Year Computer Engineering Project**

</div>

---

## Overview

**MediVision AI** is a role-based healthcare web platform integrating patient services, doctor workflows, appointments, clinical records, AI-assisted symptom assessment, limited medical-image screening, health tracking, wellness support, nearby healthcare discovery, emergency support, notifications, administration and audit logging.

Roles:

```text
PATIENT
DOCTOR
ADMIN
```

> [!IMPORTANT]
> MediVision AI is an academic healthcare-support project. AI outputs are intended for assistance, screening and decision support only. They are not a final medical diagnosis, autonomous prescription, or replacement for a qualified healthcare professional.

---

## Current Application Modules

| Area | Current functionality |
|---|---|
| Authentication | JWT-based login and protected routes |
| Patient | Profile, history, documents, medical access, medications, health tracking |
| Doctor | Profile, availability, appointments, encounters, authorized patient records |
| Appointments | Patient + Doctor appointment workflow |
| Encounters | Doctor consultation workflow |
| Diagnoses | Clinical diagnosis records |
| Prescriptions | Prescription workflow |
| Symptom AI | AI-assisted possible conditions, urgency and specialty recommendation |
| Doctor Discovery | Doctor search and recommended doctors |
| Medical Image AI | Brain MRI ResNet18 classification + Grad-CAM |
| Wellness | Diet and routine support |
| Health Education | Preventive-health content |
| Nearby Healthcare | Location/map-based healthcare discovery |
| Emergency SOS | Emergency-support workflow |
| Notifications | Shared notification center |
| Admin | Users, patients, doctors, specialties, facilities, appointments, articles, AI, SOS |
| Audit | Admin audit-log view |
| Doctor Patient Records | Authorized patient directory and restricted record view |

---

## Current Frontend Routes

Source: `frontend/src/routes/AppRoutes.jsx`.

### Public

```text
/
/services
/about
/safety
/login
/register
```

### Shared Authenticated

```text
/dashboard
/unauthorized
/notifications
```

### Patient

```text
/appointments
/patient/profile
/sos
/patient/medications
/patient/history
/medical-history        → redirects to /patient/history
/patient/documents
/patient/access
/health
/symptom-assessment
/medical-image
/doctors
/doctors/:doctorId
/wellness
/health-education
/health-education/:slug
/nearby
```

### Doctor

```text
/appointments
/doctor/profile
/doctor/availability
/doctor/encounters/:encounterId
/doctor/patients
```

### Admin

```text
/admin
/admin/users
/admin/patients
/admin/doctors
/admin/specialties
/admin/facilities
/admin/appointments
/admin/health-articles
/admin/ai-assessments
/admin/sos
/admin/audit
```

---

## Current Project Structure

```text
MediVision/
├── .github/
├── backend/
│   ├── .myenv/
│   ├── alembic/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   ├── v1/
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── scripts/
│   │   ├── seeds/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── scripts/
│   ├── tests/
│   ├── uploads/
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── requirements-phase40.txt
│   └── requirements.txt
├── docs/
│   ├── api/
│   ├── database/
│   ├── diagrams/
│   ├── reports/
│   └── research/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── config/
│       ├── constants/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── routes/
│       ├── schemas/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── ml/
│   ├── .mlenv/
│   ├── data/brain_mri/
│   ├── models/
│   ├── outputs/phase38/
│   ├── outputs/phase39/
│   ├── reports/
│   ├── src/
│   ├── README_PHASE37.md
│   ├── README_PHASE38.md
│   ├── README_PHASE39.md
│   └── requirements.txt
├── scripts/
├── tests/
├── .gitignore
└── README.md
```

> Local virtual environments, `.env`, `node_modules`, generated output and raw datasets should remain excluded from Git when appropriate.

---

## Backend Router Registration

Current `backend/app/main.py` registers router modules for:

```text
auth
health
access_test
patients
doctors
availability
discovery
recommended_doctors
appointments
encounters
diagnoses
prescriptions
medical_documents
medical_access
medication_reminders
symptom
ai
diet
activity
health_education
nearby
sos
notifications
admin
audit
medical_image
doctor_patient_records
```

The current project uses both:

```text
app/api/v1/
app/api/routes/
```

for route modules.

---

## Confirmed Current Swagger Endpoints

The current Swagger UI confirms:

```text
GET  /api/v1/admin/audit-logs

POST /api/v1/medical-image/screen
GET  /api/v1/medical-image/analyses

GET  /api/v1/doctor/patient-records
GET  /api/v1/doctor/patient-records/{patient_id}
```

Use the live Swagger UI as the authoritative endpoint list:

```text
http://127.0.0.1:8000/docs
```

---

## AI-assisted Symptom Assessment

```text
Patient Symptoms
      ↓
Standardized Symptom Catalog
      ↓
FastAPI
      ↓
Structured AI Provider Response
      ↓
Possible Conditions
      ↓
Recommended Specialty
      ↓
Urgency + Red Flags
      ↓
Safety Message
```

Use terminology such as **AI-assisted symptom assessment** and **possible conditions**, not confirmed diagnosis.

---

## Brain MRI Computer Vision

Classes:

```text
glioma
meningioma
no_tumor
pituitary
```

UI labels:

```text
Glioma
Meningioma
No Tumor
Pituitary Tumor
```

Held-out test-set results:

| Metric | Result |
|---|---:|
| Accuracy | 94.19% |
| Macro Precision | 94.32% |
| Macro Recall | 94.10% |
| Macro F1 | 94.06% |

Grad-CAM target:

```text
layer4.1.conv2
```

> These are held-out dataset classification results, not validated clinical diagnostic performance.

---

## Medical Image Screening

Frontend:

```text
/medical-image
```

Backend:

```text
POST /api/v1/medical-image/screen
GET  /api/v1/medical-image/analyses
```

Flow:

```text
Patient Upload
      ↓
Accept Disclaimer
      ↓
FastAPI
      ↓
PyTorch ResNet18
      ↓
Possible Class
      ↓
Model Score
      ↓
Grad-CAM
      ↓
Safety Message
      ↓
Suggested Specialty
```

Never label the result **Final Diagnosis**.

---

## Doctor Patient Records

Frontend:

```text
/doctor/patients
```

Backend:

```text
GET /api/v1/doctor/patient-records
GET /api/v1/doctor/patient-records/{patient_id}
```

A Doctor should see Patient records only through an authorized relationship such as an appointment relationship or active Patient-controlled medical-access grant. A UUID alone is not authorization.

---

## Technology Stack

### Frontend

```text
React.js
JavaScript
Vite
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Recharts
Axios
React Router
lucide-react
```

### Backend

```text
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
PyJWT
pwdlib / Argon2
psycopg
pytest
httpx
```

### AI / ML

```text
OpenAI API
PyTorch
torchvision
ResNet18
Grad-CAM
NumPy
Pillow
scikit-learn / XGBoost
```

---

## Run Locally

### Backend

```powershell
cd C:\Shubham\MediVision\backend
.myenv\Scripts\Activate
fastapi dev app/main.py
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```powershell
cd C:\Shubham\MediVision\frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### ML

```powershell
cd C:\Shubham\MediVision\ml
.mlenv\Scripts\Activate
```

---

## Documentation

```text
docs/
├── api/
├── database/
├── diagrams/
├── reports/
└── research/
```

Start with [`docs/README.md`](docs/README.md).

---

## Medical Disclaimer

MediVision AI is an academic project. AI/model outputs are for informational, screening and decision-support purposes only. They are not a final diagnosis, guaranteed disease determination, medical prescription, emergency medical advice, or replacement for qualified healthcare professionals.

---

## Academic Information

| Item | Details |
|---|---|
| Project | MediVision AI |
| Type | Final Year Engineering Project |
| Degree | Bachelor of Engineering — Computer Engineering |
| University | Savitribai Phule Pune University (SPPU) |
| Domain | Healthcare + Full Stack + AI/ML + Computer Vision |
