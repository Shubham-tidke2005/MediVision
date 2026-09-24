# API Overview

Swagger:

```text
http://127.0.0.1:8000/docs
```

OpenAPI JSON:

```text
http://127.0.0.1:8000/openapi.json
```

The current backend registers router modules for:

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

Confirmed current Swagger endpoints include:

```text
GET  /api/v1/admin/audit-logs
POST /api/v1/medical-image/screen
GET  /api/v1/medical-image/analyses
GET  /api/v1/doctor/patient-records
GET  /api/v1/doctor/patient-records/{patient_id}
```

For every endpoint not explicitly listed here, use the live Swagger/OpenAPI output as the authoritative source.
