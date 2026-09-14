from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
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


def register_user(
    db: Session,
    payload: RegisterRequest,
) -> User:
    if payload.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be registered publicly.",
        )

    existing_user = get_user_by_email(
        db,
        str(payload.email),
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if payload.phone_number:
        existing_phone = get_user_by_phone(
            db,
            payload.phone_number,
        )

        if existing_phone is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this phone number already exists.",
            )

    hashed_password = hash_password(
        payload.password
    )

    user = create_user(
        db,
        email=str(payload.email),
        phone_number=payload.phone_number,
        password_hash=hashed_password,
        role=payload.role,
    )

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account already exists.",
        ) from exc

    return user


def authenticate_user(
    db: Session,
    payload: LoginRequest,
) -> TokenResponse:
    user = get_user_by_email(
        db,
        str(payload.email),
    )

    if (
        user is None
        or not verify_password(
            payload.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    user.last_login_at = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        user.id
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=(
            settings.access_token_expire_minutes
            * 60
        ),
    )