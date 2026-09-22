"""add audit logs

Revision ID: 9c2f47a1d8e3
Revises: 278f7e40877a
Create Date: 2026-09-21
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


revision: str = "9c2f47a1d8e3"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "278f7e40877a"

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
        "audit_logs",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.UUID(),
            nullable=True,
        ),
        sa.Column(
            "action",
            sa.String(length=80),
            nullable=False,
        ),
        sa.Column(
            "resource_type",
            sa.String(length=80),
            nullable=False,
        ),
        sa.Column(
            "resource_id",
            sa.String(length=128),
            nullable=True,
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(
                astext_type=sa.Text()
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(
                timezone=True
            ),
            server_default=(
                sa.text("now()")
            ),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint(
            "id"
        ),
    )

    op.create_index(
        "ix_audit_logs_user_created_at",
        "audit_logs",
        ["user_id", "created_at"],
        unique=False,
    )

    op.create_index(
        "ix_audit_logs_action_created_at",
        "audit_logs",
        ["action", "created_at"],
        unique=False,
    )

    op.create_index(
        "ix_audit_logs_resource",
        "audit_logs",
        ["resource_type", "resource_id"],
        unique=False,
    )

    op.create_index(
        "ix_audit_logs_created_at",
        "audit_logs",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_audit_logs_created_at",
        table_name="audit_logs",
    )

    op.drop_index(
        "ix_audit_logs_resource",
        table_name="audit_logs",
    )

    op.drop_index(
        "ix_audit_logs_action_created_at",
        table_name="audit_logs",
    )

    op.drop_index(
        "ix_audit_logs_user_created_at",
        table_name="audit_logs",
    )

    op.drop_table(
        "audit_logs"
    )
