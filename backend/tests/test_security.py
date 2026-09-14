import uuid

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    password = "TestPassword123"

    hashed = hash_password(
        password
    )

    assert hashed != password

    assert verify_password(
        password,
        hashed,
    )

    assert not verify_password(
        "WrongPassword",
        hashed,
    )


def test_access_token():
    user_id = uuid.uuid4()

    token = create_access_token(
        user_id
    )

    decoded_user_id = decode_access_token(
        token
    )

    assert decoded_user_id == user_id