import uuid

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import (
    Session,
)

from app.api.dependencies import (
    get_current_user,
)

from app.core.database import (
    get_db,
)

from app.models.user import (
    User,
)

from app.schemas.notification import (
    MarkAllReadResponse,
    NotificationCenterResponse,
    NotificationResponse,
    UnreadCountResponse,
)

from app.services.notification import (
    get_notification_center,
    get_unread_count,
    mark_all_notifications_read,
    mark_notification_read,
)


router = APIRouter(
    prefix="/api/v1/notifications",
    tags=[
        "Notifications"
    ],
)


@router.get(
    "",
    response_model=(
        NotificationCenterResponse
    ),
)
def notifications(
    unread_only: bool = Query(
        default=False
    ),

    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),

    offset: int = Query(
        default=0,
        ge=0,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    return get_notification_center(
        db,

        user_id=(
            current_user.id
        ),

        unread_only=(
            unread_only
        ),

        limit=limit,

        offset=offset,
    )


@router.get(
    "/unread-count",
    response_model=(
        UnreadCountResponse
    ),
)
def unread_count(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    return get_unread_count(
        db,
        current_user.id,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=(
        NotificationResponse
    ),
)
def read_notification(
    notification_id: uuid.UUID,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    return mark_notification_read(
        db,

        notification_id=(
            notification_id
        ),

        user_id=(
            current_user.id
        ),
    )


@router.post(
    "/read-all",
    response_model=(
        MarkAllReadResponse
    ),
)
def read_all_notifications(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    return mark_all_notifications_read(
        db,
        current_user.id,
    )