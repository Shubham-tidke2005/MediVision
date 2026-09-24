# MediVision AI — Current ER Diagram

This diagram reflects the current major relationships from the supplied SQLAlchemy models.

```mermaid
erDiagram

    USERS ||--o| PATIENTS : owns
    USERS ||--o| DOCTORS : owns

    ADDRESSES ||--o{ PATIENTS : used_by
    ADDRESSES ||--o{ DOCTORS : used_by

    DOCTORS ||--o{ DOCTOR_SPECIALTIES : has
    SPECIALTIES ||--o{ DOCTOR_SPECIALTIES : includes

    DOCTORS ||--o{ DOCTOR_AVAILABILITY_RULES : defines
    DOCTORS ||--o{ DOCTOR_TIME_OFF : blocks
    DOCTORS ||--o{ DOCTOR_SLOTS : owns
    DOCTOR_SLOTS ||--o{ DOCTOR_SLOT_STATUS_HISTORY : tracks

    PATIENTS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : receives
    DOCTOR_SLOTS ||--o{ APPOINTMENTS : assigned_to
    APPOINTMENTS ||--o{ APPOINTMENT_STATUS_HISTORY : tracks

    APPOINTMENTS ||--o| ENCOUNTERS : creates
    PATIENTS ||--o{ ENCOUNTERS : has
    DOCTORS ||--o{ ENCOUNTERS : conducts

    ENCOUNTERS ||--o{ ENCOUNTER_DIAGNOSES : contains
    DIAGNOSES ||--o{ ENCOUNTER_DIAGNOSES : referenced_by

    ENCOUNTERS ||--o| PRESCRIPTIONS : generates
    PATIENTS ||--o{ PRESCRIPTIONS : receives
    DOCTORS ||--o{ PRESCRIPTIONS : creates

    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : contains
    MEDICINES ||--o{ PRESCRIPTION_ITEMS : referenced_by

    PATIENTS ||--o{ MEDICAL_DOCUMENTS : owns

    PATIENTS ||--o{ MEDICAL_ACCESS_GRANTS : grants
    DOCTORS ||--o{ MEDICAL_ACCESS_GRANTS : receives

    PATIENTS ||--o{ PATIENT_MEDICATIONS : has
    MEDICINES ||--o{ PATIENT_MEDICATIONS : may_reference
    PRESCRIPTION_ITEMS ||--o| PATIENT_MEDICATIONS : may_create

    PATIENT_MEDICATIONS ||--o{ MEDICATION_SCHEDULES : schedules
    MEDICATION_SCHEDULES ||--o{ MEDICATION_ADHERENCE_LOGS : records
    PATIENT_MEDICATIONS ||--o{ MEDICATION_ADHERENCE_LOGS : tracks

    HEALTH_METRIC_TYPES ||--o{ HEALTH_MEASUREMENTS : defines
    PATIENTS ||--o{ HEALTH_MEASUREMENTS : records

    PATIENTS ||--o{ DIET_PLANS : receives
    DIET_PLANS ||--o{ DIET_PLAN_ITEMS : contains

    PATIENTS ||--o{ ACTIVITY_PLANS : receives
    ACTIVITY_PLANS ||--o{ ACTIVITY_PLAN_ITEMS : contains
    ACTIVITY_PLAN_ITEMS ||--o{ ACTIVITY_LOGS : logged_as
    PATIENTS ||--o{ ACTIVITY_LOGS : records

    PATIENTS ||--o{ AI_SYMPTOM_ASSESSMENTS : owns
    SPECIALTIES ||--o{ AI_SYMPTOM_ASSESSMENTS : recommended_for

    PATIENTS ||--o{ MEDICAL_IMAGE_ANALYSES : owns

    PATIENTS ||--o{ SOS_EVENTS : triggers
    SOS_EVENTS ||--o{ SOS_EVENT_ACTIONS : tracks

    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : generates
```

## Notes

`health_articles`, `healthcare_facilities`, `symptoms`, and `alembic_version` are mostly independent/master/infrastructure tables in the supplied schema.

The live SQLAlchemy models and Alembic migrations remain authoritative if this diagram ever differs from implementation.
