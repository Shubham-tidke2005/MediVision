# Tables & Relationships

## Identity

```text
users
patients
doctors
```

Role:

```text
PATIENT
DOCTOR
ADMIN
```

## Doctor Verification

```text
PENDING
VERIFIED
REJECTED
SUSPENDED
```

## Appointments

Types:

```text
IN_PERSON
ONLINE
```

Statuses:

```text
PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
```

## Encounters

```text
IN_PERSON
ONLINE
EMERGENCY
FOLLOW_UP
```

## Diagnosis

```text
PRIMARY
SECONDARY
SUSPECTED
```

## Medical Access

```text
FULL_HISTORY
APPOINTMENT_ONLY
DOCUMENTS_ONLY
```

## Medication

Status:

```text
ACTIVE
COMPLETED
STOPPED
```

Adherence:

```text
TAKEN
MISSED
SKIPPED
LATE
```

## SOS

```text
TRIGGERED
ACKNOWLEDGED
RESOLVED
CANCELLED
```

## Important Relationships

```mermaid
erDiagram
    USERS ||--o| PATIENTS : has
    USERS ||--o| DOCTORS : has
    PATIENTS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : receives
    APPOINTMENTS ||--o| ENCOUNTERS : creates
    ENCOUNTERS ||--o{ ENCOUNTER_DIAGNOSES : contains
    ENCOUNTERS ||--o| PRESCRIPTIONS : creates
    PATIENTS ||--o{ MEDICAL_DOCUMENTS : owns
    PATIENTS ||--o{ MEDICAL_ACCESS_GRANTS : grants
    DOCTORS ||--o{ MEDICAL_ACCESS_GRANTS : receives
    PATIENTS ||--o{ AI_SYMPTOM_ASSESSMENTS : owns
    PATIENTS ||--o{ MEDICAL_IMAGE_ANALYSES : owns
    USERS ||--o{ AUDIT_LOGS : generates
```
