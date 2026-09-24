# MediVision AI — Current Enums & Important Constraints

_Last aligned with the current `app.models.enums` and supplied SQLAlchemy models on 24 September 2026._

# Current Enums

## `UserRole`

```text
PATIENT
DOCTOR
ADMIN
```

## `DoctorVerificationStatus`

```text
PENDING
VERIFIED
REJECTED
SUSPENDED
```

## `SlotStatus`

```text
AVAILABLE
HELD
BOOKED
BLOCKED
```

## `AppointmentType`

```text
IN_PERSON
ONLINE
PHONE
```

## `AppointmentStatus`

```text
REQUESTED
APPROVED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
```

## `EncounterType`

```text
IN_PERSON
ONLINE
EMERGENCY
FOLLOW_UP
```

## `DiagnosisType`

```text
PRIMARY
SECONDARY
SUSPECTED
```

## `DocumentType`

```text
LAB_REPORT
PRESCRIPTION
MRI
XRAY
DISCHARGE_SUMMARY
```

## `AccessScope`

```text
FULL_HISTORY
APPOINTMENT_ONLY
```

## `MedicationSource`

```text
PRESCRIPTION
MANUAL
```

## `MedicationStatus`

```text
ACTIVE
COMPLETED
STOPPED
```

## `AdherenceStatus`

```text
TAKEN
MISSED
SKIPPED
LATE
```

## `MetricSource`

```text
MANUAL
DEVICE
IMPORTED
```

---

# Important Database Constraints

## Doctors

```text
experience_years >= 0

default_consultation_fee IS NULL
OR default_consultation_fee >= 0
```

## Doctor Specialties

```text
Only one primary specialty per Doctor.
```

Partial unique index:

```text
doctor_id
WHERE is_primary = true
```

## Availability

```text
0 <= day_of_week <= 6
slot_duration_minutes > 0
end_time > start_time
```

## Time Off

```text
end_at > start_at
```

## Slots

```text
end_at > start_at
UNIQUE(doctor_id, start_at)
```

## Appointments

Only one active appointment may occupy a slot while status is:

```text
REQUESTED
APPROVED
```

## Encounters

```text
UNIQUE(appointment_id)
```

## Encounter Diagnoses

```text
UNIQUE(
    encounter_id,
    diagnosis_id,
    diagnosis_type
)
```

## Prescriptions

```text
UNIQUE(encounter_id)
```

## Medical Documents

```text
size_bytes > 0
```

## Medical Access

```text
UNIQUE(patient_id, doctor_id)
```

## Patient Medications

```text
end_date IS NULL OR end_date >= start_date
UNIQUE(prescription_item_id)
```

## Medication Schedule

```text
UNIQUE(patient_medication_id, time_of_day)
```

## Medication Adherence

```text
UNIQUE(medication_schedule_id, scheduled_for)
```

## Health Measurements

```text
value_primary >= 0

value_secondary IS NULL
OR value_secondary >= 0
```

## Diet Plans

Only one active Diet Plan per Patient.

## Activity Plans

Only one active Activity Plan per Patient.

## Activity Logs

```text
UNIQUE(activity_plan_item_id, log_date)
```

## Healthcare Facilities

Allowed types:

```text
HOSPITAL
CLINIC
PHARMACY
DIAGNOSTIC_CENTER
```

## SOS

Only one active SOS per Patient when status is:

```text
TRIGGERED
ACKNOWLEDGED
```

## Notifications

Allowed types:

```text
APPOINTMENT_APPROVED
APPOINTMENT_REJECTED
APPOINTMENT_REMINDER
MEDICINE_REMINDER
NEW_PRESCRIPTION
MEDICAL_ACCESS_SHARED
```
