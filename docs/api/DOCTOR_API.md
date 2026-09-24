# Doctor API

## Main Doctor Areas

```text
doctor profile
availability
appointments
encounters
diagnoses
prescriptions
authorized patient records
notifications
```

## Doctor Verification

Professional states:

```text
PENDING
VERIFIED
REJECTED
SUSPENDED
```

Sensitive clinical workflows should require a verified doctor.

## Authorized Patient Records

### Directory

```http
GET /api/v1/doctor/patient-records
```

A Patient is visible when the Doctor has:

```text
an appointment relationship
OR
an active patient-controlled access grant
```

### Detail

```http
GET /api/v1/doctor/patient-records/{patient_id}
```

Access modes:

```text
FULL_HISTORY
APPOINTMENT_ONLY
DOCUMENTS_ONLY
```

Opening a record should create:

```text
PATIENT_RECORD_VIEWED
```

in the audit log.

Knowing a Patient UUID does not grant access.
