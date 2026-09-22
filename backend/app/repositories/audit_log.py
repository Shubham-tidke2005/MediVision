import uuid

from datetime import datetime

from sqlalchemy import (
    func,
    select,
)

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def add_audit_log(
    db: Session,
    *,
    audit_log: AuditLog,
):
    db.add(audit_log)
    db.flush()
    return audit_log


def list_audit_logs(
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
    conditions = []

    if action:
        conditions.append(
            AuditLog.action == action
        )

    if resource_type:
        conditions.append(
            AuditLog.resource_type == resource_type
        )

    if resource_id:
        conditions.append(
            AuditLog.resource_id == resource_id
        )

    if user_id:
        conditions.append(
            AuditLog.user_id == user_id
        )

    if from_at:
        conditions.append(
            AuditLog.created_at >= from_at
        )

    if to_at:
        conditions.append(
            AuditLog.created_at <= to_at
        )

    statement = (
        select(AuditLog)
        .where(*conditions)
        .order_by(
            AuditLog.created_at.desc()
        )
        .offset(offset)
        .limit(limit)
    )

    count_statement = (
        select(
            func.count(AuditLog.id)
        )
        .where(*conditions)
    )

    items = list(
        db.scalars(statement).all()
    )

    total = int(
        db.scalar(count_statement)
        or 0
    )

    return items, total
