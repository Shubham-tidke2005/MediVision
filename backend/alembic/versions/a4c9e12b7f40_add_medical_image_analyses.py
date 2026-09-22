"""add medical image analyses

Revision ID: a4c9e12b7f40
Revises: 9c2f47a1d8e3
Create Date: 2026-09-22
"""

from typing import (
    Sequence,
    Union,
)

from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import (
    postgresql,
)


revision: str = (
    "a4c9e12b7f40"
)

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "9c2f47a1d8e3"

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    op.create_table(
        "medical_image_analyses",

        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "patient_id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "original_filename",
            sa.String(
                length=255
            ),
            nullable=False,
        ),

        sa.Column(
            "mime_type",
            sa.String(
                length=80
            ),
            nullable=False,
        ),

        sa.Column(
            "file_size_bytes",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "predicted_class",
            sa.String(
                length=40
            ),
            nullable=False,
        ),

        sa.Column(
            "display_label",
            sa.String(
                length=80
            ),
            nullable=False,
        ),

        sa.Column(
            "model_score",
            sa.Numeric(
                precision=8,
                scale=7,
            ),
            nullable=False,
        ),

        sa.Column(
            "class_scores",
            postgresql.JSONB(
                astext_type=(
                    sa.Text()
                )
            ),
            nullable=False,
        ),

        sa.Column(
            "suggested_specialty",
            sa.String(
                length=120
            ),
            nullable=False,
        ),

        sa.Column(
            "model_name",
            sa.String(
                length=120
            ),
            nullable=False,
        ),

        sa.Column(
            "model_version",
            sa.String(
                length=80
            ),
            nullable=False,
        ),

        sa.Column(
            "gradcam_target_layer",
            sa.String(
                length=120
            ),
            nullable=False,
        ),

        sa.Column(
            "disclaimer_accepted",
            sa.Boolean(),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(
                timezone=True
            ),
            server_default=(
                sa.text(
                    "now()"
                )
            ),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            [
                "patient_id",
            ],
            [
                "patients.id",
            ],
            ondelete="CASCADE",
        ),

        sa.PrimaryKeyConstraint(
            "id"
        ),
    )

    op.create_index(
        "ix_medical_image_analyses_patient_id",
        "medical_image_analyses",
        [
            "patient_id",
        ],
        unique=False,
    )

    op.create_index(
        "ix_medical_image_analyses_created_at",
        "medical_image_analyses",
        [
            "created_at",
        ],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_medical_image_analyses_created_at",
        table_name=(
            "medical_image_analyses"
        ),
    )

    op.drop_index(
        "ix_medical_image_analyses_patient_id",
        table_name=(
            "medical_image_analyses"
        ),
    )

    op.drop_table(
        "medical_image_analyses"
    )
