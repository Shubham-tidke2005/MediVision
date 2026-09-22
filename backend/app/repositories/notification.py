import uuid

from sqlalchemy import (
    func,
    select,
    update,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.notification import (
    Notification,
)


def list_notifications(
    db: Session,
    *,
    user_id: uuid.UUID,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
):
    statement = (
        select(
            Notification
        )
        .where(
            Notification.user_id
            == user_id,

            Notification.available_at
            <= func.now(),
        )
    )

    if unread_only:
        statement = (
            statement.where(
                Notification.read_at
                .is_(None)
            )
        )

    statement = (
        statement
        .order_by(
            Notification
                .created_at
                .desc()
        )
        .offset(
            offset
        )
        .limit(
            limit
        )
    )

    return list(
        db.scalars(
            statement
        ).all()
    )


def count_unread_notifications(
    db: Session,
    user_id: uuid.UUID,
):
    return (
        db.scalar(
            select(
                func.count(
                    Notification.id
                )
            )
            .where(
                Notification.user_id
                == user_id,

                Notification.read_at
                .is_(None),

                Notification.available_at
                <= func.now(),
            )
        )
        or 0
    )


def get_user_notification(
    db: Session,
    *,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
    for_update: bool = False,
):
    statement = (
        select(
            Notification
        )
        .where(
            Notification.id
            == notification_id,

            Notification.user_id
            == user_id,
        )
    )

    if for_update:
        statement = (
            statement
            .with_for_update()
        )

    return db.scalar(
        statement
    )


def mark_all_user_notifications_read(
    db: Session,
    user_id: uuid.UUID,
):
    result = db.execute(
        update(
            Notification
        )
        .where(
            Notification.user_id
            == user_id,

            Notification.read_at
            .is_(None),

            Notification.available_at
            <= func.now(),
        )
        .values(
            read_at=func.now(),
            updated_at=func.now(),
        )
    )

    return (
        result.rowcount
        or 0
    )