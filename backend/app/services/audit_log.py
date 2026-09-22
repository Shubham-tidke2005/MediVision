import uuid

from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

from app.repositories.audit_log import (
    add_audit_log,
    list_audit_logs,
)

from app.schemas.audit_log import (
    AuditAction,
    AuditLogListResponse,
    AuditLogResponse,
    AuditResourceType,
)


_BLOCKED_KEY_PARTS = {
    "password",
    "passwd",
    "pwd",
    "password_hash",
    "hashed_password",
    "jwt",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "secret",
    "secret_key",
    "api_key",
    "apikey",
    "private_key",
    "prompt",
    "raw_prompt",
    "system_prompt",
    "full_record",
    "medical_history",
    "patient_data",
    "file_content",
    "document_content",
}

_MAX_METADATA_DEPTH = 3
_MAX_METADATA_KEYS = 30
_MAX_LIST_ITEMS = 20
_MAX_STRING_LENGTH = 300


def _normalized_key(key: Any) -> str:
    return (
        str(key)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )


def _is_blocked_key(key: Any) -> bool:
    normalized = _normalized_key(key)

    return any(
        part in normalized
        for part in _BLOCKED_KEY_PARTS
    )


def sanitize_audit_metadata(
    value: Any,
    *,
    depth: int = 0,
):
    if depth > _MAX_METADATA_DEPTH:
        return "[OMITTED]"

    if value is None:
        return None

    if isinstance(
        value,
        (bool, int, float),
    ):
        return value

    if isinstance(
        value,
        (uuid.UUID, datetime),
    ):
        return str(value)

    if isinstance(value, str):
        if len(value) > _MAX_STRING_LENGTH:
            return (
                value[:_MAX_STRING_LENGTH]
                + "…"
            )

        return value

    if isinstance(value, dict):
        clean = {}

        for index, (key, item) in enumerate(
            value.items()
        ):
            if index >= _MAX_METADATA_KEYS:
                clean["_truncated"] = True
                break

            key_string = str(key)

            if _is_blocked_key(
                key_string
            ):
                clean[
                    key_string
                ] = "[REDACTED]"
                continue

            clean[key_string] = (
                sanitize_audit_metadata(
                    item,
                    depth=depth + 1,
                )
            )

        return clean

    if isinstance(
        value,
        (list, tuple, set),
    ):
        items = list(value)

        clean_items = [
            sanitize_audit_metadata(
                item,
                depth=depth + 1,
            )
            for item
            in items[:_MAX_LIST_ITEMS]
        ]

        if len(items) > _MAX_LIST_ITEMS:
            clean_items.append(
                "[TRUNCATED]"
            )

        return clean_items

    return str(value)[:_MAX_STRING_LENGTH]


def record_audit_event(
    db: Session,
    *,
    user_id: uuid.UUID | None,
    action: AuditAction | str,
    resource_type: (
        AuditResourceType
        | str
    ),
    resource_id: (
        uuid.UUID
        | int
        | str
        | None
    ) = None,
    metadata: (
        dict[str, Any]
        | None
    ) = None,
):
    action_value = (
        action.value
        if isinstance(
            action,
            AuditAction,
        )
        else str(action)
    )

    resource_type_value = (
        resource_type.value
        if isinstance(
            resource_type,
            AuditResourceType,
        )
        else str(resource_type)
    )

    audit_log = AuditLog(
        user_id=user_id,
        action=action_value,
        resource_type=resource_type_value,
        resource_id=(
            None
            if resource_id is None
            else str(resource_id)
        ),
        metadata_json=(
            sanitize_audit_metadata(
                metadata or {}
            )
        ),
    )

    return add_audit_log(
        db,
        audit_log=audit_log,
    )


def _serialize(
    item: AuditLog,
):
    return AuditLogResponse(
        id=item.id,
        user_id=item.user_id,
        action=item.action,
        resource_type=item.resource_type,
        resource_id=item.resource_id,
        metadata=(
            item.metadata_json
            or {}
        ),
        created_at=item.created_at,
    )


def get_audit_logs(
    db: Session,
    *,
    action: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    user_id: uuid.UUID | None = None,
    from_at: datetime | None = None,
    to_at: datetime | None = None,
    limit: int = 50,
    offset: int = 0,
):
    items, total = list_audit_logs(
        db,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        user_id=user_id,
        from_at=from_at,
        to_at=to_at,
        limit=limit,
        offset=offset,
    )

    return AuditLogListResponse(
        items=[
            _serialize(item)
            for item in items
        ],
        total=total,
        limit=limit,
        offset=offset,
    )
