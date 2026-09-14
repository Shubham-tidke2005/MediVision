from getpass import getpass

from pydantic import EmailStr, TypeAdapter
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User


email_adapter = TypeAdapter(EmailStr)


def create_admin() -> None:
    email_input = input(
        "Admin email: "
    ).strip().lower()

    email = str(
        email_adapter.validate_python(
            email_input
        )
    )

    password = getpass(
        "Admin password: "
    )

    confirm_password = getpass(
        "Confirm password: "
    )

    if password != confirm_password:
        raise ValueError(
            "Passwords do not match."
        )

    if len(password) < 8:
        raise ValueError(
            "Password must contain at least 8 characters."
        )

    with SessionLocal() as db:
        existing = db.scalar(
            select(User).where(
                User.email == email
            )
        )

        if existing is not None:
            raise ValueError(
                "A user with this email already exists."
            )

        admin = User(
            email=email,
            password_hash=hash_password(
                password
            ),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )

        db.add(admin)
        db.commit()

        print(
            "Admin account created successfully."
        )


if __name__ == "__main__":
    create_admin()