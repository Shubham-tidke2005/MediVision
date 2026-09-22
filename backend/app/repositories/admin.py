import uuid

from datetime import (
    datetime,
    timezone,
)

from decimal import Decimal

from sqlalchemy import (
    MetaData,
    Table,
    func,
    inspect,
    insert,
    select,
    update,
)

from sqlalchemy.dialects.postgresql import UUID as PGUUID

from sqlalchemy.orm import Session


RESOURCE_FIELDS = {
    "users": [
        "id",
        "email",
        "role",
        "is_active",
        "is_verified",
        "created_at",
        "updated_at",
    ],
    "patients": [
        "id",
        "user_id",
        "patient_code",
        "first_name",
        "last_name",
        "date_of_birth",
        "dob",
        "gender",
        "blood_group",
        "created_at",
        "updated_at",
    ],
    "doctors": [
        "id",
        "user_id",
        "doctor_code",
        "first_name",
        "last_name",
        "qualification",
        "registration_number",
        "verification_status",
        "is_accepting_patients",
        "is_active",
        "created_at",
        "updated_at",
    ],
    "specialties": [
        "id",
        "code",
        "name",
        "description",
        "is_active",
        "created_at",
        "updated_at",
    ],
    "healthcare_facilities": [
        "id",
        "name",
        "facility_type",
        "address_line_1",
        "address_line_2",
        "city",
        "district",
        "state",
        "postal_code",
        "country",
        "phone",
        "email",
        "website",
        "latitude",
        "longitude",
        "notes",
        "is_active",
        "created_at",
        "updated_at",
    ],
    "appointments": [
        "id",
        "patient_id",
        "doctor_id",
        "slot_id",
        "appointment_type",
        "status",
        "reason",
        "start_at",
        "end_at",
        "created_at",
        "updated_at",
    ],
    "health_articles": [
        "id",
        "category",
        "slug",
        "title",
        "summary",
        "content",
        "key_points",
        "professional_advice_note",
        "source_name",
        "source_url",
        "status",
        "featured",
        "published_at",
        "created_at",
        "updated_at",
    ],
    "ai_symptom_assessments": [
        "id",
        "patient_id",
        "status",
        "urgency",
        "triage_level",
        "recommended_specialty_code",
        "recommended_specialty_name",
        "provider",
        "provider_name",
        "model",
        "model_name",
        "created_at",
        "updated_at",
    ],
    "symptom_assessments": [
        "id",
        "patient_id",
        "status",
        "urgency",
        "triage_level",
        "recommended_specialty_code",
        "recommended_specialty_name",
        "provider",
        "provider_name",
        "model",
        "model_name",
        "created_at",
        "updated_at",
    ],
    "sos_events": [
        "id",
        "patient_id",
        "status",
        "share_location",
        "latitude",
        "longitude",
        "location_accuracy_m",
        "emergency_contact_name",
        "emergency_contact_phone",
        "message",
        "triggered_at",
        "acknowledged_at",
        "resolved_at",
        "cancelled_at",
        "created_at",
        "updated_at",
    ],
}


SENSITIVE_COLUMNS = {
    "password",
    "password_hash",
    "hashed_password",
    "refresh_token",
    "access_token",
    "token",
    "secret",
    "api_key",
}


def table_exists(
    db: Session,
    table_name: str,
) -> bool:
    return inspect(
        db.get_bind()
    ).has_table(
        table_name
    )


def get_table(
    db: Session,
    table_name: str,
) -> Table:
    return Table(
        table_name,
        MetaData(),
        autoload_with=db.get_bind(),
    )


def get_existing_fields(
    table: Table,
    requested: list[str],
) -> list[str]:
    return [
        field
        for field in requested
        if field in table.c
    ]


def serialize_value(value):
    if isinstance(value, Decimal):
        return float(value)

    return value


def serialize_mapping(mapping) -> dict:
    return {
        key: serialize_value(value)
        for key, value
        in dict(mapping).items()
    }


def count_table(
    db: Session,
    table_name: str,
) -> int:
    if not table_exists(
        db,
        table_name,
    ):
        return 0

    table = get_table(
        db,
        table_name,
    )

    return int(
        db.scalar(
            select(
                func.count()
            )
            .select_from(
                table
            )
        )
        or 0
    )


def count_where(
    db: Session,
    table_name: str,
    column_name: str,
    values,
) -> int:
    if not table_exists(
        db,
        table_name,
    ):
        return 0

    table = get_table(
        db,
        table_name,
    )

    if column_name not in table.c:
        return 0

    column = table.c[column_name]

    if isinstance(
        values,
        (
            list,
            tuple,
            set,
        ),
    ):
        condition = column.in_(
            list(values)
        )
    else:
        condition = (
            column
            == values
        )

    return int(
        db.scalar(
            select(
                func.count()
            )
            .select_from(
                table
            )
            .where(
                condition
            )
        )
        or 0
    )


def list_resource(
    db: Session,
    *,
    table_name: str,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[dict], int]:
    if not table_exists(
        db,
        table_name,
    ):
        return [], 0

    table = get_table(
        db,
        table_name,
    )

    requested_fields = (
        RESOURCE_FIELDS.get(
            table_name,
            [],
        )
    )

    fields = get_existing_fields(
        table,
        requested_fields,
    )

    if not fields:
        fields = [
            column.name
            for column
            in table.columns
            if column.name
            not in SENSITIVE_COLUMNS
        ][:20]

    statement = select(
        *[
            table.c[field]
            for field
            in fields
        ]
    )

    order_column = None

    for candidate in (
        "created_at",
        "triggered_at",
        "start_at",
        "id",
    ):
        if candidate in table.c:
            order_column = table.c[candidate]
            break

    if order_column is not None:
        statement = statement.order_by(
            order_column.desc()
        )

    statement = (
        statement
        .offset(offset)
        .limit(limit)
    )

    rows = (
        db.execute(
            statement
        )
        .mappings()
        .all()
    )

    total = count_table(
        db,
        table_name,
    )

    return (
        [
            serialize_mapping(row)
            for row
            in rows
        ],
        total,
    )


def coerce_id(
    table: Table,
    raw_value: str,
):
    column = table.c.id

    try:
        python_type = column.type.python_type
    except NotImplementedError:
        return raw_value

    if python_type is uuid.UUID:
        return uuid.UUID(
            str(raw_value)
        )

    if python_type is int:
        return int(raw_value)

    return raw_value


def get_resource_by_id(
    db: Session,
    *,
    table_name: str,
    record_id: str,
) -> dict | None:
    if not table_exists(
        db,
        table_name,
    ):
        return None

    table = get_table(
        db,
        table_name,
    )

    if "id" not in table.c:
        return None

    pk = coerce_id(
        table,
        record_id,
    )

    fields = get_existing_fields(
        table,
        RESOURCE_FIELDS.get(
            table_name,
            [],
        ),
    )

    if not fields:
        fields = [
            column.name
            for column in table.columns
            if column.name
            not in SENSITIVE_COLUMNS
        ]

    row = (
        db.execute(
            select(
                *[
                    table.c[field]
                    for field in fields
                ]
            )
            .where(
                table.c.id == pk
            )
        )
        .mappings()
        .first()
    )

    if row is None:
        return None

    return serialize_mapping(row)


def _prepare_insert_payload(
    table: Table,
    payload: dict,
) -> dict:
    values = {
        key: value
        for key, value
        in payload.items()
        if key in table.c
    }

    if (
        "id" in table.c
        and "id" not in values
    ):
        id_column = table.c.id

        try:
            python_type = id_column.type.python_type
        except NotImplementedError:
            python_type = None

        if (
            python_type is uuid.UUID
            or isinstance(
                id_column.type,
                PGUUID,
            )
        ):
            values["id"] = uuid.uuid4()

    return values


def insert_resource(
    db: Session,
    *,
    table_name: str,
    payload: dict,
) -> dict:
    table = get_table(
        db,
        table_name,
    )

    values = _prepare_insert_payload(
        table,
        payload,
    )

    if (
        "created_at" in table.c
        and "created_at" not in values
        and table.c.created_at.server_default
        is None
    ):
        values["created_at"] = datetime.now(
            timezone.utc
        )

    row = (
        db.execute(
            insert(table)
            .values(**values)
            .returning(*table.columns)
        )
        .mappings()
        .one()
    )

    return serialize_mapping(row)


def update_resource(
    db: Session,
    *,
    table_name: str,
    record_id: str,
    payload: dict,
) -> dict | None:
    table = get_table(
        db,
        table_name,
    )

    if "id" not in table.c:
        return None

    pk = coerce_id(
        table,
        record_id,
    )

    values = {
        key: value
        for key, value
        in payload.items()
        if key in table.c
    }

    if (
        "updated_at" in table.c
        and "updated_at" not in values
    ):
        values["updated_at"] = datetime.now(
            timezone.utc
        )

    if not values:
        return get_resource_by_id(
            db,
            table_name=table_name,
            record_id=record_id,
        )

    row = (
        db.execute(
            update(table)
            .where(
                table.c.id == pk
            )
            .values(**values)
            .returning(*table.columns)
        )
        .mappings()
        .first()
    )

    if row is None:
        return None

    return serialize_mapping(row)
