import uuid

from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
)

from app.core.database import get_db

from app.schemas.audit_log import (
    AuditLogListResponse,
)

from app.services.audit_log import (
    get_audit_logs,
)


router = APIRouter(
    prefix="/api/v1/admin/audit-logs",
    tags=["Admin Audit Logs"],
)


def get_current_admin(
    current_user=Depends(
        get_current_user
    ),
):
    role = getattr(
        current_user,
        "role",
        None,
    )

    role_value = getattr(
        role,
        "value",
        role,
    )

    if (
        str(role_value).upper()
        != "ADMIN"
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=(
                "Admin access required."
            ),
        )

    if not getattr(
        current_user,
        "is_active",
        True,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="Inactive account.",
        )

    return current_user


@router.get(
    "",
    response_model=(
        AuditLogListResponse
    ),
)
def list_admin_audit_logs(
    action: str | None = Query(
        default=None,
        max_length=80,
    ),

    resource_type: (
        str
        | None
    ) = Query(
        default=None,
        max_length=80,
    ),

    resource_id: (
        str
        | None
    ) = Query(
        default=None,
        max_length=128,
    ),

    user_id: (
        uuid.UUID
        | None
    ) = Query(
        default=None,
    ),

    from_at: (
        datetime
        | None
    ) = Query(
        default=None,
    ),

    to_at: (
        datetime
        | None
    ) = Query(
        default=None,
    ),

    limit: int = Query(
        default=50,
        ge=1,
        le=200,
    ),

    offset: int = Query(
        default=0,
        ge=0,
    ),

    db: Session = Depends(get_db),

    _admin=Depends(
        get_current_admin
    ),
):
    if (
        from_at
        and to_at
        and from_at > to_at
    ):
        raise HTTPException(
            status_code=422,
            detail=(
                "from_at must be before "
                "or equal to to_at."
            ),
        )

    return get_audit_logs(
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
