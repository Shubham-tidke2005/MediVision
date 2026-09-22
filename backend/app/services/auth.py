from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import (
    IntegrityError,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.config import (
    settings,
)

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.models.enums import (
    UserRole,
)

from app.models.user import (
    User,
)

from app.repositories.user import (
    create_user,
    get_user_by_email,
    get_user_by_phone,
)

from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)

from app.schemas.audit_log import (
    AuditAction,
    AuditResourceType,
)

from app.services.audit_log import (
    record_audit_event,
)


# =========================================================
# REGISTER USER
# =========================================================


def register_user(
    db: Session,
    payload: RegisterRequest,
) -> User:
    # -----------------------------------------------------
    # ADMIN accounts cannot be registered publicly.
    # -----------------------------------------------------

    if (
        payload.role
        == UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Admin accounts cannot be "
                "registered publicly."
            ),
        )


    # -----------------------------------------------------
    # EMAIL DUPLICATE CHECK
    # -----------------------------------------------------

    existing_user = (
        get_user_by_email(
            db,
            str(
                payload.email
            ),
        )
    )


    if (
        existing_user
        is not None
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_409_CONFLICT
            ),
            detail=(
                "An account with this email "
                "already exists."
            ),
        )


    # -----------------------------------------------------
    # PHONE DUPLICATE CHECK
    # -----------------------------------------------------

    if payload.phone_number:
        existing_phone = (
            get_user_by_phone(
                db,
                payload.phone_number,
            )
        )


        if (
            existing_phone
            is not None
        ):
            raise HTTPException(
                status_code=(
                    status
                    .HTTP_409_CONFLICT
                ),
                detail=(
                    "An account with this phone "
                    "number already exists."
                ),
            )


    # -----------------------------------------------------
    # HASH PASSWORD
    # -----------------------------------------------------

    hashed_password = (
        hash_password(
            payload.password
        )
    )


    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    user = create_user(
        db,
        email=str(
            payload.email
        ),
        phone_number=(
            payload.phone_number
        ),
        password_hash=(
            hashed_password
        ),
        role=(
            payload.role
        ),
    )


    # -----------------------------------------------------
    # SAVE USER
    # -----------------------------------------------------

    try:
        db.commit()

        db.refresh(
            user
        )

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_409_CONFLICT
            ),
            detail=(
                "Account already exists."
            ),
        ) from exc


    return user


# =========================================================
# AUTHENTICATE USER
# =========================================================


def authenticate_user(
    db: Session,
    payload: LoginRequest,
) -> TokenResponse:
    # -----------------------------------------------------
    # FIND USER BY EMAIL
    # -----------------------------------------------------

    user = (
        get_user_by_email(
            db,
            str(
                payload.email
            ),
        )
    )


    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    if (
        user is None
        or not verify_password(
            payload.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )


    # -----------------------------------------------------
    # ACTIVE ACCOUNT CHECK
    # -----------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=(
                status
                .HTTP_403_FORBIDDEN
            ),
            detail=(
                "Account is inactive."
            ),
        )


    # -----------------------------------------------------
    # UPDATE LAST LOGIN
    # -----------------------------------------------------

    user.last_login_at = (
        datetime.now(
            timezone.utc
        )
    )


    # -----------------------------------------------------
    # AUDIT SUCCESSFUL LOGIN
    #
    # DO NOT log:
    # - password
    # - JWT
    # - access token
    # - refresh token
    # - API key
    # -----------------------------------------------------

    role_value = getattr(
        user.role,
        "value",
        user.role,
    )


    record_audit_event(
        db,
        user_id=(
            user.id
        ),
        action=(
            AuditAction.LOGIN
        ),
        resource_type=(
            AuditResourceType.USER
        ),
        resource_id=(
            user.id
        ),
        metadata={
            "role":
                str(
                    role_value
                ),
        },
    )


    # -----------------------------------------------------
    # SAVE LAST LOGIN + AUDIT EVENT TOGETHER
    # -----------------------------------------------------

    try:
        db.commit()

        db.refresh(
            user
        )

    except Exception:
        db.rollback()
        raise


    # -----------------------------------------------------
    # CREATE ACCESS TOKEN
    # -----------------------------------------------------

    access_token = (
        create_access_token(
            user.id
        )
    )


    return TokenResponse(
        access_token=(
            access_token
        ),
        expires_in=(
            settings
            .access_token_expire_minutes
            * 60
        ),
    )