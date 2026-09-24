# Patient API

## Patient Areas

Representative patient API modules include:

```text
patients
appointments
medical history
medical documents
medical access
medication reminders
health tracking
symptom assessment
medical image screening
diet & routine
nearby healthcare
SOS
notifications
```

## Important Rule

A client-supplied Patient UUID is not authorization.

Patient ownership must be derived from the authenticated user.

## Medical Access

Patients can grant doctors access using scopes:

```text
FULL_HISTORY
APPOINTMENT_ONLY
DOCUMENTS_ONLY
```

A grant is active only while it is not revoked and not expired.

## Medical Image

```http
POST /api/v1/medical-image/screen
```

Multipart fields:

```text
image
disclaimer_accepted
```

Supported:

```text
JPG
JPEG
PNG
```

The response is an AI-assisted screening result, not a final diagnosis.
