# AI Symptom Assessment API

## Symptom Catalog

```http
GET /api/v1/symptoms
```

The frontend should submit standardized symptom selections rather than uncontrolled arbitrary text.

## AI Assessment

```http
POST /api/v1/ai/symptom-assessments
```

Typical structured output:

```text
possible conditions
recommended specialty
specialty reason
urgency
red flags
safety message
symptom codes
```

Urgency:

```text
ROUTINE
URGENT
EMERGENCY
```

The endpoint must not autonomously prescribe medicines or claim a confirmed diagnosis.
