# Doctor Patient Records API

Confirmed by the current Swagger UI:

```text
GET /api/v1/doctor/patient-records
GET /api/v1/doctor/patient-records/{patient_id}
```

Frontend route:

```text
/doctor/patients
```

## Directory

Returns the Patient directory authorized for the current Doctor.

Authorization may come from an appointment relationship or an active Patient-controlled medical-access grant.

## Detail

The detail endpoint re-checks authorization before returning Patient record data.

A Patient UUID alone does not grant access.

Sensitive record views should be auditable with an action such as:

```text
PATIENT_RECORD_VIEWED
```
