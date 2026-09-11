# MediVision AI

> **AI-Powered Healthcare Assistance and Diagnostic Support Platform**  
> **Tagline:** *Predict • Prevent • Monitor • Recover*

MediVision AI is a full-stack healthcare web application that brings multiple healthcare services into one platform. It combines **AI-assisted symptom assessment, doctor recommendation, appointment management, digital medical records, medicine reminders, health tracking, personalized diet and routine planning, nearby healthcare discovery, emergency SOS, multilingual health information, and limited medical image screening**.

> **Important:** MediVision AI is designed for **healthcare assistance and decision support only**. It does **not** replace qualified healthcare professionals and does not provide final medical diagnoses or prescriptions.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Main Features](#main-features)
- [User Roles](#user-roles)
- [System Workflow](#system-workflow)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Modules](#core-modules)
- [Database Design](#database-design)
- [AI and ML Modules](#ai-and-ml-modules)
- [Project Structure](#project-structure)
- [Development Roadmap](#development-roadmap)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security and Privacy](#security-and-privacy)
- [Future Scope](#future-scope)
- [Project Status](#project-status)
- [Disclaimer](#disclaimer)

---

## Project Overview

Healthcare activities are often spread across different platforms. A patient may use one application to search symptoms, another to find a doctor, another to book an appointment, and separate tools to manage reports, medicines, diet, or fitness.

**MediVision AI** aims to provide an integrated digital healthcare ecosystem where patients can move through a connected healthcare journey:

```text
Patient
   ↓
AI-Assisted Symptom Assessment
   ↓
Possible Health Conditions
   ↓
Recommended Medical Specialty
   ↓
Doctor Discovery
   ↓
Appointment Booking
   ↓
Doctor Consultation
   ↓
Diagnosis / Prescription
   ↓
Digital Medical History
   ↓
Medicine / Health / Lifestyle Management
```

The system also includes a limited **Computer Vision module** for AI-assisted analysis of selected medical images.

---

## Problem Statement

Patients may face difficulties in:

- Understanding symptoms and deciding which specialist to consult
- Finding doctors based on specialization and availability
- Booking and managing appointments
- Maintaining medical records digitally
- Managing medicines and health routines
- Tracking health metrics over time
- Finding nearby healthcare facilities
- Accessing emergency assistance
- Accessing healthcare information in their preferred language
- Understanding medical-image screening results in a simple way

Existing healthcare services often solve these problems separately. MediVision AI aims to connect these services through one unified platform.

---

## Objectives

The main objectives of MediVision AI are:

- Provide AI-assisted symptom assessment
- Suggest appropriate medical specialties
- Connect patients with suitable doctors
- Support appointment request, approval, rejection, cancellation, and completion
- Maintain structured digital medical history
- Support prescriptions and medicine reminders
- Track health measurements and lifestyle activities
- Provide personalized diet and routine support
- Show nearby hospitals, clinics, pharmacies, and diagnostic centers
- Provide emergency SOS support
- Provide multilingual healthcare information
- Perform limited AI-assisted medical-image screening
- Improve explainability using SHAP and Grad-CAM
- Maintain secure and role-based access to healthcare data

---

## Main Features

### Patient Features

- Registration and login
- Patient profile management
- Medical history
- Allergies and chronic conditions
- Family medical history
- Insurance information
- AI symptom checker
- Possible-condition prediction
- Specialist recommendation
- Doctor search and filtering
- Appointment booking
- Appointment history
- Digital prescriptions
- Medicine reminders
- Medication adherence tracking
- Medical report upload and management
- Health metrics tracking
- Health trend charts
- Diet plans
- Activity and routine plans
- Nearby healthcare services
- Emergency contacts
- SOS assistance
- Medical image screening
- Multilingual health awareness content

### Doctor Features

- Doctor registration
- Professional profile
- Specialization management
- Language information
- Facility association
- Availability scheduling
- Time-off management
- Appointment request management
- Patient consultation records
- Diagnosis management
- Prescription creation
- Patient medical-history access with authorization
- Review of AI-assisted medical-image results

### Admin Features

- User management
- Doctor verification
- Specialty management
- Healthcare facility management
- Appointment monitoring
- Health content management
- Platform analytics
- Audit and activity monitoring

---

## User Roles

MediVision AI supports three main roles:

```text
PATIENT
DOCTOR
ADMIN
```

### Patient

Can manage their health information, use AI features, search doctors, book appointments, store records, track medicines and health activities.

### Doctor

Can manage availability, handle appointments, view authorized patient information, create consultation records, diagnoses, and prescriptions.

### Admin

Can verify doctors, manage users, specialties, facilities, healthcare content, and monitor the platform.

---

## System Workflow

```text
                     ┌──────────────────────┐
                     │        USER          │
                     └──────────┬───────────┘
                                │
                         Register / Login
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
              Patient         Doctor          Admin
                 │              │              │
                 │              │              │
        Symptom Assessment      │        Platform Management
                 │              │
                 ▼              │
          AI Prediction         │
                 │              │
                 ▼              │
     Specialist Recommendation │
                 │              │
                 ▼              │
          Doctor Discovery      │
                 │              │
                 ▼              │
          Appointment Request ──┘
                 │
                 ▼
          Doctor Approval
                 │
                 ▼
            Consultation
                 │
        ┌────────┼────────┐
        │        │        │
    Diagnosis Prescription Reports
        │        │        │
        └────────┼────────┘
                 │
                 ▼
          Medical History
                 │
                 ▼
     Long-Term Health Management
```

---

## Technology Stack

### Frontend

- **React.js**
- **JavaScript**
- **Tailwind CSS**
- **shadcn/ui**
- **TanStack Query**
- **React Hook Form**
- **Zod**
- **Recharts**

### Backend

- **FastAPI**
- **Pydantic**
- **SQLAlchemy**
- **Alembic**
- **PostgreSQL**

### AI / Machine Learning

- **Scikit-learn**
- **XGBoost**
- **PyTorch**
- **OpenCV**
- **SHAP**
- **Grad-CAM**

---

## System Architecture

```text
                      ┌─────────────────────┐
                      │    React Frontend   │
                      │ Tailwind + shadcn   │
                      └──────────┬──────────┘
                                 │
                           REST API / JSON
                                 │
                      ┌──────────▼──────────┐
                      │      FastAPI        │
                      │      Backend        │
                      └──────────┬──────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
   ┌─────────────┐        ┌─────────────┐       ┌─────────────┐
   │ PostgreSQL  │        │ Symptom ML  │       │ Medical CV  │
   │  Database   │        │ sklearn/XGB │       │   PyTorch   │
   └─────────────┘        └──────┬──────┘       └──────┬──────┘
                                 │                     │
                               SHAP                 Grad-CAM
```

---

## Core Modules

### 1. Authentication and Role Management

- JWT-based authentication
- Access and refresh tokens
- Password hashing
- Role-based authorization
- Patient, Doctor, and Admin access control

### 2. Patient Management

- Personal details
- Medical profile
- Allergies
- Chronic conditions
- Emergency contacts
- Family medical history
- Insurance details

### 3. Doctor Management

- Qualification
- Registration number
- Specialization
- Experience
- Consultation fee
- Languages
- Facility association
- Doctor verification

### 4. Doctor Availability

- Weekly availability rules
- Appointment slot generation
- Time-off / leave management
- Prevention of double booking

### 5. Appointment Management

Appointment lifecycle:

```text
PENDING
   ↓
APPROVED
   ↓
COMPLETED
```

Alternative states:

```text
REJECTED
CANCELLED
NO_SHOW
```

### 6. Medical Encounters

An appointment represents a booking.

An encounter represents the actual consultation.

The encounter may contain:

- Chief complaint
- Doctor notes
- Diagnosis
- Prescription
- Follow-up date

### 7. Digital Medical Records

- Consultation history
- Diagnoses
- Prescriptions
- Reports
- Medical documents
- AI assessment history
- Medical image screening history

### 8. Medicine Management

- Patient medicines
- Medicine schedules
- Reminder times
- Adherence tracking

Possible adherence states:

```text
TAKEN
MISSED
SKIPPED
LATE
```

### 9. Health Tracking

Possible measurements:

- Weight
- Blood pressure
- Blood glucose
- Heart rate
- Sleep
- Steps
- Water intake

Charts are displayed using **Recharts**.

### 10. Diet and Activity Management

- Meal planning
- Calorie targets
- Water targets
- Walking
- Yoga
- Stretching
- Activity completion tracking

### 11. Nearby Healthcare

Supports discovery of:

- Hospitals
- Clinics
- Pharmacies
- Diagnostic centers

### 12. Emergency SOS

- Emergency contacts
- Nearby healthcare facilities
- Optional user location
- SOS event history

### 13. Multilingual Health Awareness

Initial languages:

- English
- Hindi
- Marathi

---

## Database Design

MediVision AI uses **PostgreSQL**.

Major groups of tables include:

```text
AUTH
├── users
├── roles
├── user_roles
└── user_sessions

PATIENT
├── patient_profiles
├── patient_insurance_policies
├── patient_allergies
├── patient_conditions
├── patient_family_history
└── emergency_contacts

DOCTOR
├── doctor_profiles
├── specialties
├── doctor_specialties
├── doctor_languages
├── doctor_facilities
├── doctor_availability_rules
├── doctor_time_off
└── doctor_slots

APPOINTMENTS
├── appointments
├── appointment_status_history
└── doctor_reviews

CLINICAL
├── encounters
├── diagnoses
├── encounter_diagnoses
├── prescriptions
├── prescription_items
└── medical_documents

MEDICATION
├── medicines
├── patient_medications
├── medication_schedules
└── medication_adherence_logs

HEALTH
├── health_metric_types
├── health_measurements
├── diet_plans
├── diet_plan_items
├── activity_plans
├── activity_plan_items
└── activity_logs

AI
├── ai_model_versions
├── symptoms
├── symptom_assessments
├── assessment_symptoms
├── assessment_predictions
├── prediction_explanations
├── medical_image_analyses
└── image_analysis_predictions

SYSTEM
├── notifications
├── notification_preferences
├── health_articles
├── health_article_translations
└── audit_logs
```

---

## AI and ML Modules

### AI Symptom Assessment

The user selects symptoms such as:

```text
Fever
Cough
Headache
Fatigue
Rash
```

The ML pipeline:

```text
Symptoms
   ↓
Preprocessing
   ↓
Scikit-learn / XGBoost Model
   ↓
Top Possible Conditions
   ↓
Confidence Scores
   ↓
Recommended Specialty
   ↓
SHAP Explanation
```

Example output:

```text
Possible Conditions

1. Influenza          72%
2. Viral Infection    18%
3. Common Cold        10%

Suggested Specialty:
General Physician
```

The output is presented as **AI-assisted information**, not a confirmed medical diagnosis.

---

## Medical Image AI

The initial Computer Vision implementation can focus on one use case such as:

### Brain MRI Classification

Possible classes:

```text
Glioma
Meningioma
Pituitary Tumor
No Tumor
```

Pipeline:

```text
Medical Image
     ↓
OpenCV Preprocessing
     ↓
PyTorch Model
     ↓
Prediction
     ↓
Confidence
     ↓
Grad-CAM
     ↓
AI-Assisted Screening Result
```

The system stores:

- Model version
- Prediction
- Confidence
- Grad-CAM output
- Analysis time
- Optional doctor review

---

## Project Structure

```text
medivision-ai/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── features/
│       ├── hooks/
│       ├── api/
│       ├── schemas/
│       ├── routes/
│       └── utils/
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── core/
│       ├── models/
│       ├── schemas/
│       ├── repositories/
│       ├── services/
│       ├── api/
│       ├── dependencies/
│       └── utils/
│
├── ai/
│   ├── symptom-model/
│   │   ├── data/
│   │   ├── notebooks/
│   │   ├── training/
│   │   └── models/
│   │
│   └── medical-image-model/
│       ├── data/
│       ├── notebooks/
│       ├── training/
│       └── models/
│
├── docs/
│   ├── database/
│   ├── diagrams/
│   └── api/
│
├── tests/
├── README.md
└── .gitignore
```

---

## Development Roadmap

Recommended implementation order:

```text
1. Project Setup
      ↓
2. PostgreSQL + Database
      ↓
3. FastAPI Foundation
      ↓
4. Authentication
      ↓
5. Patient / Doctor Profiles
      ↓
6. Doctor Availability
      ↓
7. Appointments
      ↓
8. Medical Encounters
      ↓
9. Diagnosis / Prescription
      ↓
10. Digital Medical History
      ↓
11. Medicine Reminders
      ↓
12. Health Tracking
      ↓
13. AI Symptom Assessment
      ↓
14. Doctor Recommendation
      ↓
15. Medical Image AI
      ↓
16. Diet / Activity
      ↓
17. Nearby Healthcare
      ↓
18. Emergency SOS
      ↓
19. Notifications
      ↓
20. Admin Dashboard
      ↓
21. Testing
      ↓
22. Security
      ↓
23. Deployment
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd medivision-ai
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend will normally run at:

```text
http://localhost:8000
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/medivision_dev

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7
```

For the frontend, create an environment file such as:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> Never commit `.env` files, passwords, secret keys, API keys, or production credentials to GitHub.

---

## API Documentation

FastAPI automatically provides interactive API documentation.

After starting the backend:

### Swagger UI

```text
http://localhost:8000/docs
```

### ReDoc

```text
http://localhost:8000/redoc
```

---

## Testing

### Backend

Use:

```text
Pytest
```

Important tests include:

- Registration
- Login
- JWT authentication
- Role authorization
- Patient access control
- Doctor access control
- Doctor availability
- Appointment booking
- Double-booking prevention
- Appointment approval/rejection
- Prescription creation
- Medical access control
- Symptom prediction
- Medical image prediction

### Frontend

Test:

- Forms
- Validation
- Protected routes
- API error handling
- Appointment workflow
- Patient dashboard
- Doctor dashboard

---

## Security and Privacy

MediVision AI should implement:

- Password hashing
- JWT authentication
- Refresh-token handling
- Role-based access control
- Object-level authorization
- PostgreSQL constraints
- Secure medical-document access
- Input validation
- File-type and file-size validation
- CORS configuration
- Audit logging
- Patient-controlled medical-history sharing
- Environment-based secrets
- HTTPS in production

Sensitive medical information should never be exposed through logs or unauthorized API responses.

---

## Future Scope

Possible future improvements:

- Video consultation
- Wearable-device integration
- Advanced health trend prediction
- Additional medical-image models
- Drug interaction checking
- Hospital capacity information
- Family health profiles
- Digital health twin
- More regional languages
- Real-time push notifications
- Advanced healthcare analytics
- Mobile application

---

## Project Status

```text
[ ] Project Setup
[ ] Database
[ ] Authentication
[ ] Patient Module
[ ] Doctor Module
[ ] Appointment Module
[ ] Medical Records
[ ] Prescription Module
[ ] Medicine Reminder
[ ] Health Tracking
[ ] Symptom AI
[ ] Doctor Recommendation
[ ] Medical Image AI
[ ] Diet / Activity
[ ] Nearby Healthcare
[ ] Emergency SOS
[ ] Admin Dashboard
[ ] Testing
[ ] Deployment
```

Update this section as development progresses.

---

## Disclaimer

MediVision AI is an **academic healthcare assistance project**.

The AI models and health-related outputs provided by the system are intended for **educational, informational, and decision-support purposes only**.

They must not be interpreted as:

- Final medical diagnoses
- Medical prescriptions
- Emergency medical advice
- A replacement for professional healthcare consultation

Users should consult qualified healthcare professionals for medical diagnosis and treatment, and seek immediate professional help in emergencies.

---

## Academic Project

**Project:** MediVision AI  
**Category:** Artificial Intelligence + Full Stack Web Development + Computer Vision + Healthcare Analytics  
**Degree:** Bachelor of Engineering — Computer Engineering  
**University:** Savitribai Phule Pune University (SPPU)

---

## License

This project is currently intended for academic and educational use.

A formal open-source license can be added later if the repository is made public.
