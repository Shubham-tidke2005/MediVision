# MediVision AI — API Overview

## Base URL

```text
http://localhost:8000/api/v1
```

Swagger:

```text
http://localhost:8000/docs
```

## Main API Groups

```text
/auth
/patients
/doctors
/availability
/discovery
/appointments
/encounters
/diagnoses
/prescriptions
/medical-documents
/medical-access
/medication-reminders
/symptoms
/ai
/diet
/activity
/health-education
/nearby
/sos
/notifications
/admin
/medical-image
/doctor/patient-records
```

## Common Status Codes

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
503 Service Unavailable
```

## Authentication Header

```http
Authorization: Bearer <access_token>
```

Swagger should be treated as the authoritative source for the exact currently registered route set.
