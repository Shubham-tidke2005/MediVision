# Frontend Routes

Source: `frontend/src/routes/AppRoutes.jsx`

## Public

```text
/
/services
/about
/safety
/login
/register
```

## Shared Authenticated

```text
/dashboard
/unauthorized
/notifications
```

## Patient

```text
/appointments
/patient/profile
/sos
/patient/medications
/patient/history
/medical-history → redirects to /patient/history
/patient/documents
/patient/access
/health
/symptom-assessment
/medical-image
/doctors
/doctors/:doctorId
/wellness
/health-education
/health-education/:slug
/nearby
```

## Doctor

```text
/appointments
/doctor/profile
/doctor/availability
/doctor/encounters/:encounterId
/doctor/patients
```

## Admin

```text
/admin
/admin/users
/admin/patients
/admin/doctors
/admin/specialties
/admin/facilities
/admin/appointments
/admin/health-articles
/admin/ai-assessments
/admin/sos
/admin/audit
```

## Route Guards

```text
ProtectedRoute
PublicOnlyRoute
RoleRoute
```

Roles:

```text
ROLES.PATIENT
ROLES.DOCTOR
ROLES.ADMIN
```
