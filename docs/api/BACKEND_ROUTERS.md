# Backend Router Registration

Source: `backend/app/main.py`

## Routers from `app.api.v1`

Included with `prefix="/api/v1"`:

```text
auth_router
access_test_router
patients_router
doctors_router
availability_router
discovery_router
recommended_doctors_router
appointments_router
encounters_router
diagnoses_router
prescriptions_router
medical_documents_router
medical_access_router
medication_reminders_router
health_router
symptom_router
ai_router
```

## Routers from `app.api.routes`

Included directly, so their route modules own their effective prefixes:

```text
diet_router
activity_router
health_education_router
nearby_router
sos_router
notifications_router
admin_router
audit_router
medical_image_router
doctor_patient_records_router
```

## CORS

```text
allowed origin: settings.frontend_url
credentials: true
methods: all
headers: all
```

## API Metadata

```text
Title: MediVision AI
Version: 1.0.0
OpenAPI: 3.1
```

Use `/docs` or `/openapi.json` for exact live endpoints.
