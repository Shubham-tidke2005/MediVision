# Authentication & Authorization API

## Roles

```text
PATIENT
DOCTOR
ADMIN
```

MediVision uses JWT authentication.

The backend must enforce authorization even if the frontend already hides a route.

## Access Token

Typical request:

```http
Authorization: Bearer <access_token>
```

## Current Security Rules

- Public registration must not create ADMIN users.
- Patient-owned APIs resolve the current patient from the authenticated user.
- Doctor clinical APIs use doctor authorization.
- Verified-doctor-only operations must check professional verification status.
- Admin APIs must reject non-admin users.
- Invalid/missing JWT should return `401`.
- Authenticated users without required access should receive `403` or a deliberately concealed `404` for sensitive resources.

## Axios Client

The shared frontend API client attaches the token per request.

Do not globally force:

```javascript
"Content-Type": "application/json"
```

because file uploads use `FormData`.
