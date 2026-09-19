"""add specialty code

Revision ID: 1d8a27984c95
Revises: 5a8d2627fd94
Create Date: 2026-09-18 18:42:48.520707

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d8a27984c95'
down_revision: Union[str, Sequence[str], None] = '5a8d2627fd94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add column temporarily nullable because
    #    specialty rows already exist.
    op.add_column(
        "specialties",
        sa.Column(
            "code",
            sa.String(length=100),
            nullable=True,
        ),
    )

    # 2. Backfill existing specialties.
    op.execute(
        """
        UPDATE specialties
        SET code = CASE name
            WHEN 'General Medicine' THEN 'GENERAL_MEDICINE'
            WHEN 'Neurology' THEN 'NEUROLOGY'
            WHEN 'Cardiology' THEN 'CARDIOLOGY'
            WHEN 'Pulmonology' THEN 'PULMONOLOGY'
            WHEN 'Gastroenterology' THEN 'GASTROENTEROLOGY'
            WHEN 'Dermatology' THEN 'DERMATOLOGY'
            WHEN 'ENT' THEN 'ENT'
            WHEN 'Orthopedics' THEN 'ORTHOPEDICS'
            WHEN 'Ophthalmology' THEN 'OPHTHALMOLOGY'
            WHEN 'Gynecology' THEN 'GYNECOLOGY'
            WHEN 'Urology' THEN 'UROLOGY'
            WHEN 'Psychiatry' THEN 'PSYCHIATRY'
            WHEN 'Emergency Medicine' THEN 'EMERGENCY_MEDICINE'
            ELSE NULL
        END
        """
    )

    # 3. Fail explicitly if an existing specialty
    #    was not mapped.
    connection = op.get_bind()

    unmapped_count = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM specialties
            WHERE code IS NULL
            """
        )
    ).scalar_one()

    if unmapped_count:
        raise RuntimeError(
            "One or more existing specialties "
            "do not have a code mapping."
        )

    # 4. Now make code mandatory.
    op.alter_column(
        "specialties",
        "code",
        existing_type=sa.String(length=100),
        nullable=False,
    )

    # 5. Stable code must be unique.
    op.create_index(
        "ix_specialties_code",
        "specialties",
        ["code"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_specialties_code",
        table_name="specialties",
    )

    op.drop_column(
        "specialties",
        "code",
    )