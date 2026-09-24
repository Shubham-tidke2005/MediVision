# Database Documentation Corrections

The current SQLAlchemy models supplied on 24 September 2026 reveal several differences from older planning documentation.

## 1. Appointment Status

Current:

```text
REQUESTED
APPROVED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
```

Older draft:

```text
PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
```

Use `REQUESTED` in current code/documentation.

---

## 2. Appointment Type

Current:

```text
IN_PERSON
ONLINE
PHONE
```

Older documentation omitted `PHONE`.

---

## 3. Slot Status

Current:

```text
AVAILABLE
HELD
BOOKED
BLOCKED
```

Older draft documentation used:

```text
AVAILABLE
RESERVED
BOOKED
BLOCKED
EXPIRED
```

Use the current enum.

---

## 4. Medical Access Scope

Current:

```text
FULL_HISTORY
APPOINTMENT_ONLY
```

The current enum does not contain:

```text
DOCUMENTS_ONLY
```

Any service or documentation referencing `DOCUMENTS_ONLY` should be corrected unless that enum is deliberately added in a future migration.

---

## 5. Metric Source

Current:

```text
MANUAL
DEVICE
IMPORTED
```

Older documentation mentioned `DOCTOR`.

Use `IMPORTED` for the current schema.

---

## 6. Document Type

Current enum:

```text
LAB_REPORT
PRESCRIPTION
MRI
XRAY
DISCHARGE_SUMMARY
```

Older planning documents included additional values such as CT scan and ultrasound. Those are not present in the current enum shown.

---

## 7. Medical Access Active State

The current `medical_access_grants` table includes:

```text
is_active
expires_at
revoked_at
```

Authorization logic should consider the real business rule around all relevant current fields.

---

# Recommended Code Review

The Doctor Patient Records feature should be checked against the current enum and grant fields because older implementation drafts may have assumed:

```text
DOCUMENTS_ONLY
```

and may have checked only:

```text
revoked_at
expires_at
```

without checking:

```text
is_active
```

That should be aligned with the actual schema before treating the feature as final.
