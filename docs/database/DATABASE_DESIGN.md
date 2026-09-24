# MediVision AI — Database Design

## Database

```text
PostgreSQL
```

ORM / migrations:

```text
SQLAlchemy 2.x
Alembic
psycopg 3
```

## Design Principles

- UUID primary keys for major entities
- timezone-aware timestamps
- DOB instead of storing age
- separate appointment and encounter entities
- separate AI output and clinician diagnosis
- patient-controlled access
- explicit foreign keys
- audit logs for sensitive actions

## Major Modules

```text
users
patients
doctors
specialties
doctor_specialties
availability
doctor_slots
appointments
encounters
diagnoses
prescriptions
medical_documents
medical_access_grants
medication management
health tracking
AI assessments
medical image analyses
diet/activity
health articles
facilities
SOS
notifications
audit_logs
```
