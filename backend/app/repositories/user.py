import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User


def get_user_by_id(
    db: Session,
    user_id: uuid.UUID,
) -> User | None:
    return db.scalar(
        select(User).where(
            User.id == user_id
        )
    )


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    return db.scalar(
        select(User).where(
            User.email == email
        )
    )


def get_user_by_phone(
    db: Session,
    phone_number: str,
) -> User | None:
    return db.scalar(
        select(User).where(
            User.phone_number == phone_number
        )
    )


def create_user(
    db: Session,
    *,
    email: str,
    password_hash: str,
    role: UserRole,
    phone_number: str | None = None,
) -> User:
    user = User(
        email=email,
        phone_number=phone_number,
        password_hash=password_hash,
        role=role,
    )

    db.add(user)

    return user