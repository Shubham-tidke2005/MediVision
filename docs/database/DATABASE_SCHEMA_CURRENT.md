# MediVision AI — Current Database Schema

_Last aligned with the current PostgreSQL/SQLAlchemy schema on 24 September 2026._

## Database Summary

Current PostgreSQL schema contains **40 tables**:

```text
1.  activity_logs
2.  activity_plan_items
3.  activity_plans
4.  addresses
5.  ai_symptom_assessments
6.  alembic_version
7.  appointment_status_history
8.  appointments
9.  audit_logs
10. diagnoses
11. diet_plan_items
12. diet_plans
13. doctor_availability_rules
14. doctor_slot_status_history
15. doctor_slots
16. doctor_specialties
17. doctor_time_off
18. doctors
19. encounter_diagnoses
20. encounters
21. health_articles
22. health_measurements
23. health_metric_types
24. healthcare_facilities
25. medical_access_grants
26. medical_documents
27. medical_image_analyses
28. medication_adherence_logs
29. medication_schedules
30. medicines
31. notifications
32. patient_medications
33. patients
34. prescription_items
35. prescriptions
36. sos_event_actions
37. sos_events
38. specialties
39. symptoms
40. users
```

---

# 1. Identity & Profiles

## `users`

Purpose: central authentication/account table.

Important fields:

```text
id                  UUID PK
email               VARCHAR(255) UNIQUE NOT NULL
phone_number        VARCHAR(20) UNIQUE NULL
password_hash       VARCHAR(255) NOT NULL
role                user_role enum NOT NULL
is_active           BOOLEAN NOT NULL DEFAULT true
is_verified         BOOLEAN NOT NULL DEFAULT false
last_login_at       TIMESTAMPTZ NULL
created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

Relationships:

```text
users 1 ── 0..1 patients
users 1 ── 0..1 doctors
```

Role enum:

```text
PATIENT
DOCTOR
ADMIN
```

---

## `patients`

Purpose: Patient profile.

Important fields:

```text
id                  UUID PK
user_id             UUID FK users.id UNIQUE NOT NULL
patient_code        VARCHAR(30) UNIQUE NOT NULL
first_name          VARCHAR(100) NOT NULL
last_name           VARCHAR(100) NOT NULL
date_of_birth       DATE NOT NULL
gender              VARCHAR(30) NULL
blood_group         VARCHAR(10) NULL
height_cm           NUMERIC(5,2) NULL
address_id          UUID FK addresses.id NULL
emergency_notes     TEXT NULL
is_active           BOOLEAN NOT NULL DEFAULT true
created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

## `doctors`

Purpose: Doctor professional profile.

Important fields:

```text
id                          UUID PK
user_id                     UUID FK users.id UNIQUE NOT NULL
doctor_code                 VARCHAR(30) UNIQUE NOT NULL
first_name                  VARCHAR(100) NOT NULL
last_name                   VARCHAR(100) NOT NULL
registration_number         VARCHAR(100) UNIQUE NOT NULL
qualification               VARCHAR(255) NOT NULL
experience_years            INTEGER NOT NULL DEFAULT 0
bio                         TEXT NULL
default_consultation_fee    NUMERIC(10,2) NULL
verification_status         doctor_verification_status NOT NULL DEFAULT PENDING
is_accepting_patients       BOOLEAN NOT NULL DEFAULT false
is_active                   BOOLEAN NOT NULL DEFAULT true
address_id                  UUID FK addresses.id NULL
created_at                  TIMESTAMPTZ NOT NULL
updated_at                  TIMESTAMPTZ NOT NULL
```

Constraints:

```text
experience_years >= 0
default_consultation_fee IS NULL OR default_consultation_fee >= 0
```

Doctor verification:

```text
PENDING
VERIFIED
REJECTED
SUSPENDED
```

---

## `addresses`

Purpose: reusable Patient/Doctor address information.

Fields:

```text
id
address_line_1
address_line_2
city
district
state
postal_code
country
latitude
longitude
created_at
updated_at
```

Coordinates:

```text
latitude  NUMERIC(9,6)
longitude NUMERIC(9,6)
```

---

# 2. Specialties

## `specialties`

Fields:

```text
id              INTEGER PK AUTOINCREMENT
code            VARCHAR(100) UNIQUE NOT NULL
name            VARCHAR(150) UNIQUE NOT NULL
description     TEXT NULL
is_active       BOOLEAN NOT NULL DEFAULT true
```

## `doctor_specialties`

Composite primary key:

```text
doctor_id
specialty_id
```

Fields:

```text
doctor_id       UUID FK doctors.id
specialty_id    INTEGER FK specialties.id
is_primary      BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
```

Important index:

```text
Only one primary specialty per Doctor:
UNIQUE doctor_id WHERE is_primary = true
```

---

# 3. Doctor Availability

## `doctor_availability_rules`

Fields:

```text
id
doctor_id
day_of_week
start_time
end_time
slot_duration_minutes
valid_from
valid_until
timezone
is_active
created_at
updated_at
```

Constraints:

```text
0 <= day_of_week <= 6
slot_duration_minutes > 0
end_time > start_time
```

Default timezone:

```text
Asia/Kolkata
```

---

## `doctor_time_off`

Fields:

```text
id
doctor_id
start_at
end_at
reason
created_at
```

Constraint:

```text
end_at > start_at
```

---

## `doctor_slots`

Fields:

```text
id
doctor_id
start_at
end_at
status
created_at
updated_at
```

Constraint:

```text
end_at > start_at
UNIQUE(doctor_id, start_at)
```

Current slot states:

```text
AVAILABLE
HELD
BOOKED
BLOCKED
```

---

## `doctor_slot_status_history`

Fields:

```text
id
slot_id
old_status
new_status
reason
changed_at
```

---

# 4. Appointments

## `appointments`

Fields:

```text
id
patient_id
doctor_id
slot_id
appointment_type
status
reason
patient_notes
requested_at
approved_at
cancelled_at
cancellation_reason
created_at
updated_at
```

Current appointment types:

```text
IN_PERSON
ONLINE
PHONE
```

Current appointment statuses:

```text
REQUESTED
APPROVED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
```

Important partial unique index:

```text
One active Appointment may occupy a slot when status is:

REQUESTED
APPROVED
```

Implementation condition:

```sql
slot_id IS NOT NULL
AND status IN ('REQUESTED', 'APPROVED')
```

---

## `appointment_status_history`

Fields:

```text
id
appointment_id
old_status
new_status
changed_by_user_id
reason
changed_at
```

---

# 5. Encounters, Diagnoses & Prescriptions

## `encounters`

Fields:

```text
id
appointment_id
patient_id
doctor_id
encounter_type
chief_complaint
subjective_notes
objective_notes
assessment_notes
plan_notes
started_at
ended_at
created_at
updated_at
```

Constraint:

```text
UNIQUE(appointment_id)
```

Encounter types:

```text
IN_PERSON
ONLINE
EMERGENCY
FOLLOW_UP
```

---

## `diagnoses`

Master diagnosis table.

Fields:

```text
id
name
code
description
is_active
created_at
updated_at
```

---

## `encounter_diagnoses`

Links diagnoses to an encounter.

Fields:

```text
id
encounter_id
diagnosis_id
diagnosis_type
notes
created_by_user_id
created_at
updated_at
```

Constraint:

```text
UNIQUE(encounter_id, diagnosis_id, diagnosis_type)
```

Diagnosis types:

```text
PRIMARY
SECONDARY
SUSPECTED
```

---

## `medicines`

Medicine catalog.

Fields:

```text
id
name
generic_name
dosage_form
description
is_active
created_at
updated_at
```

---

## `prescriptions`

Fields:

```text
id
encounter_id
patient_id
doctor_id
general_instructions
prescribed_at
created_at
updated_at
```

Constraint:

```text
UNIQUE(encounter_id)
```

---

## `prescription_items`

Fields:

```text
id
prescription_id
medicine_id
strength
dose
frequency
route
duration_days
quantity
instructions
sort_order
created_at
updated_at
```

---

# 6. Medical Documents & Access

## `medical_documents`

Fields:

```text
id
patient_id
document_type
storage_key
original_filename
mime_type
size_bytes
created_at
```

Constraint:

```text
size_bytes > 0
```

Current document types:

```text
LAB_REPORT
PRESCRIPTION
MRI
XRAY
DISCHARGE_SUMMARY
```

Storage design:

```text
Only the relative storage key is stored in the database.
```

Example:

```text
medical_documents/<patient-uuid>/<random>.pdf
```

---

## `medical_access_grants`

Fields:

```text
id
patient_id
doctor_id
scope
is_active
granted_at
expires_at
revoked_at
updated_at
```

Constraint:

```text
UNIQUE(patient_id, doctor_id)
```

Current access scopes:

```text
FULL_HISTORY
APPOINTMENT_ONLY
```

Important:

The actual current enum does **not** contain `DOCUMENTS_ONLY`.

A grant should be considered usable only according to the business rules around:

```text
is_active
revoked_at
expires_at
```

---

# 7. AI Symptom Assessment

## `symptoms`

Fields:

```text
id              INTEGER PK
code            VARCHAR(100) UNIQUE
name            VARCHAR(150) UNIQUE
description     TEXT
is_active       BOOLEAN DEFAULT true
created_at
updated_at
```

---

## `ai_symptom_assessments`

Purpose: stores a successful AI-assisted symptom assessment.

Fields:

```text
id
patient_id
symptoms_json
duration
possible_conditions_json
recommended_specialty_id
recommended_specialty_code
specialty_reason
urgency
red_flags_json
safety_message
provider
model_name
created_at
```

Indexes:

```text
patient_id
created_at
recommended_specialty_id
```

Important domain rule:

```text
AI symptom assessment ≠ confirmed medical diagnosis
```

---

# 8. Medical Image Screening

## `medical_image_analyses`

Fields:

```text
id
patient_id
original_filename
mime_type
file_size_bytes
predicted_class
display_label
model_score
class_scores
suggested_specialty
model_name
model_version
gradcam_target_layer
disclaimer_accepted
created_at
```

Data types include:

```text
class_scores    JSONB
model_score     NUMERIC(8,7)
```

The record stores analysis metadata rather than raw image bytes.

---

# 9. Medication Management

## `patient_medications`

Fields:

```text
id
patient_id
medicine_id
medicine_name
prescription_item_id
source
status
strength
dose
route
instructions
start_date
end_date
created_at
updated_at
```

Constraints:

```text
end_date IS NULL OR end_date >= start_date
UNIQUE(prescription_item_id)
```

Medication source:

```text
PRESCRIPTION
MANUAL
```

Medication status:

```text
ACTIVE
COMPLETED
STOPPED
```

---

## `medication_schedules`

Fields:

```text
id
patient_medication_id
time_of_day
timezone
is_active
created_at
```

Constraint:

```text
UNIQUE(patient_medication_id, time_of_day)
```

Default timezone:

```text
Asia/Kolkata
```

---

## `medication_adherence_logs`

Fields:

```text
id
patient_medication_id
medication_schedule_id
scheduled_for
status
taken_at
notes
recorded_at
```

Constraint:

```text
UNIQUE(medication_schedule_id, scheduled_for)
```

Adherence statuses:

```text
TAKEN
MISSED
SKIPPED
LATE
```

---

# 10. Health Tracking

## `health_metric_types`

Fields:

```text
id
code
name
primary_label
primary_unit
secondary_label
secondary_unit
is_active
created_at
```

---

## `health_measurements`

Fields:

```text
id
patient_id
metric_type_id
value_primary
value_secondary
measured_at
source
notes
created_at
```

Constraints:

```text
value_primary >= 0
value_secondary IS NULL OR value_secondary >= 0
```

Current metric sources:

```text
MANUAL
DEVICE
IMPORTED
```

---

# 11. Diet & Activity

## `diet_plans`

Fields include:

```text
patient_id
age
height_cm
weight_kg
activity_level
diet_preference
goal
bmi
estimated_daily_calories
water_target_ml
source
title
calculation_note
safety_message
is_active
created_at
updated_at
```

Current default source:

```text
RULE_BASED
```

Important partial unique index:

```text
Only one active Diet Plan per Patient.
```

---

## `diet_plan_items`

Fields:

```text
id
diet_plan_id
meal_type
food_name
quantity
instructions
sort_order
created_at
```

---

## `activity_plans`

Fields:

```text
id
patient_id
goal
activity_level
available_minutes_per_day
sleep_hours_snapshot
title
source
safety_message
is_active
created_at
updated_at
```

Current default source:

```text
RULE_BASED
```

Only one active Activity Plan per Patient.

---

## `activity_plan_items`

Fields:

```text
id
activity_plan_id
activity_type
title
description
target_value
target_unit
duration_minutes
sort_order
created_at
```

---

## `activity_logs`

Fields:

```text
id
patient_id
activity_plan_item_id
log_date
status
actual_value
notes
created_at
updated_at
```

Constraint:

```text
UNIQUE(activity_plan_item_id, log_date)
```

---

# 12. Health Education

## `health_articles`

Fields:

```text
id
category
slug
title
summary
content
key_points_json
professional_advice_note
source_name
source_url
status
is_featured
published_at
created_at
updated_at
```

Uses JSONB for:

```text
key_points_json
```

---

# 13. Healthcare Facilities

## `healthcare_facilities`

Fields:

```text
id
name
facility_type
address_line_1
address_line_2
city
district
state
postal_code
country
phone
email
website
latitude
longitude
notes
is_active
created_at
updated_at
```

Current facility types:

```text
HOSPITAL
CLINIC
PHARMACY
DIAGNOSTIC_CENTER
```

Default country:

```text
India
```

---

# 14. SOS

## `sos_events`

Fields:

```text
id
patient_id
status
share_location
latitude
longitude
location_accuracy_m
emergency_contact_name
emergency_contact_phone
message
triggered_at
acknowledged_at
resolved_at
cancelled_at
created_at
updated_at
```

Statuses:

```text
TRIGGERED
ACKNOWLEDGED
RESOLVED
CANCELLED
```

Important partial unique index:

```text
Only one active SOS per Patient
when status is TRIGGERED or ACKNOWLEDGED.
```

---

## `sos_event_actions`

Fields:

```text
id
sos_event_id
action_type
description
metadata_json
created_at
```

---

# 15. Notifications

## `notifications`

Fields:

```text
id
user_id
notification_type
title
message
related_entity_type
related_entity_id
data_json
available_at
read_at
created_at
updated_at
```

Current allowed notification types:

```text
APPOINTMENT_APPROVED
APPOINTMENT_REJECTED
APPOINTMENT_REMINDER
MEDICINE_REMINDER
NEW_PRESCRIPTION
MEDICAL_ACCESS_SHARED
```

---

# 16. Audit Logging

## `audit_logs`

Fields:

```text
id
user_id
action
resource_type
resource_id
metadata
created_at
```

Indexes:

```text
(user_id, created_at)
(action, created_at)
(resource_type, resource_id)
created_at
```

Audit metadata must remain minimal and must not contain secrets or unnecessary full clinical content.

---

# 17. Alembic

## `alembic_version`

Managed by Alembic to record the applied migration revision.

Do not edit this table manually during normal development.

---

# Important Corrections Compared with Older Draft Documentation

The actual current schema uses:

```text
Appointment status: REQUESTED
not PENDING

Appointment type includes:
PHONE

Slot status:
AVAILABLE, HELD, BOOKED, BLOCKED

not:
AVAILABLE, RESERVED, BOOKED, BLOCKED, EXPIRED

Medical Access scopes:
FULL_HISTORY, APPOINTMENT_ONLY

not:
FULL_HISTORY, APPOINTMENT_ONLY, DOCUMENTS_ONLY

Metric Source:
MANUAL, DEVICE, IMPORTED

not:
MANUAL, DEVICE, DOCTOR
```

These values should be used in new documentation and code.
