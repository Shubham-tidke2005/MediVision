# MediVision AI — Tables & Relationships

## Current Table Count

```text
40 tables
```

## Domain Groups

### Identity

```text
users
patients
doctors
addresses
```

### Doctor Setup

```text
specialties
doctor_specialties
doctor_availability_rules
doctor_time_off
doctor_slots
doctor_slot_status_history
```

### Appointment / Clinical

```text
appointments
appointment_status_history
encounters
diagnoses
encounter_diagnoses
medicines
prescriptions
prescription_items
```

### Patient Records

```text
medical_documents
medical_access_grants
patient_medications
medication_schedules
medication_adherence_logs
```

### Health & Wellness

```text
health_metric_types
health_measurements
diet_plans
diet_plan_items
activity_plans
activity_plan_items
activity_logs
health_articles
```

### AI

```text
symptoms
ai_symptom_assessments
medical_image_analyses
```

### Facility / Emergency / Notifications

```text
healthcare_facilities
sos_events
sos_event_actions
notifications
```

### Security / Infrastructure

```text
audit_logs
alembic_version
```

---

# Core Relationships

```text
users
 ├── 0..1 patients
 └── 0..1 doctors

addresses
 ├── 0..N patients
 └── 0..N doctors

doctors
 ├── N..N specialties via doctor_specialties
 ├── 0..N doctor_availability_rules
 ├── 0..N doctor_time_off
 ├── 0..N doctor_slots
 ├── 0..N appointments
 ├── 0..N encounters
 └── 0..N prescriptions

patients
 ├── 0..N appointments
 ├── 0..N encounters
 ├── 0..N prescriptions
 ├── 0..N medical_documents
 ├── 0..N medical_access_grants
 ├── 0..N patient_medications
 ├── 0..N health_measurements
 ├── 0..N diet_plans
 ├── 0..N activity_plans
 ├── 0..N activity_logs
 ├── 0..N ai_symptom_assessments
 ├── 0..N medical_image_analyses
 └── 0..N sos_events

appointments
 ├── 0..N appointment_status_history
 └── 0..1 encounter

encounters
 ├── 0..N encounter_diagnoses
 └── 0..1 prescription

prescriptions
 └── 0..N prescription_items

patient_medications
 └── 0..N medication_schedules

medication_schedules
 └── 0..N medication_adherence_logs

sos_events
 └── 0..N sos_event_actions
```

---

# Important Domain Meaning

```text
Appointment
= scheduling/workflow

Encounter
= actual clinical consultation

Diagnosis
= clinician-linked clinical record

AI symptom assessment
= AI decision-support output

Prescription
= clinician record

Medication reminder
= adherence support

Medical access grant
= Patient-controlled Doctor access

Medical image analysis
= AI screening/classification metadata
```
