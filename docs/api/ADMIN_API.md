# Admin API

Prefix:

```text
/api/v1/admin
```

## Current Admin Modules

```text
dashboard
users
patients
doctors
doctor verification
specialties
facilities
appointments
health articles
AI assessments
SOS events
audit logs
```

Representative routes:

```text
GET   /api/v1/admin/dashboard

GET   /api/v1/admin/users
PATCH /api/v1/admin/users/{user_id}/active

GET   /api/v1/admin/patients

GET   /api/v1/admin/doctors
PATCH /api/v1/admin/doctors/{doctor_id}/verification

GET   /api/v1/admin/specialties
POST  /api/v1/admin/specialties
PUT   /api/v1/admin/specialties/{specialty_id}

GET   /api/v1/admin/facilities
POST  /api/v1/admin/facilities
PUT   /api/v1/admin/facilities/{facility_id}

GET   /api/v1/admin/appointments

GET   /api/v1/admin/health-articles
POST  /api/v1/admin/health-articles
PUT   /api/v1/admin/health-articles/{article_id}

GET   /api/v1/admin/ai-assessments

GET   /api/v1/admin/sos
GET   /api/v1/admin/sos/{event_id}
```

Audit logging is admin-only.
