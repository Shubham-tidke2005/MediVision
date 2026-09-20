import uuid

from datetime import datetime

from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


# =========================================================
# ARTICLE CATEGORY
# =========================================================


class HealthArticleCategory(
    str,
    Enum,
):
    DIABETES_PREVENTION = (
        "DIABETES_PREVENTION"
    )

    HYPERTENSION_AWARENESS = (
        "HYPERTENSION_AWARENESS"
    )

    HEALTHY_DIET = (
        "HEALTHY_DIET"
    )

    SLEEP = (
        "SLEEP"
    )

    EXERCISE = (
        "EXERCISE"
    )

    VACCINATION = (
        "VACCINATION"
    )

    GENERAL_SCREENING = (
        "GENERAL_SCREENING"
    )


# =========================================================
# CATEGORY RESPONSE
# =========================================================


class HealthCategoryResponse(
    BaseModel
):
    code: HealthArticleCategory

    label: str

    description: str


# =========================================================
# ARTICLE SUMMARY RESPONSE
# =========================================================


class HealthArticleSummaryResponse(
    BaseModel
):
    id: uuid.UUID

    category: HealthArticleCategory

    slug: str

    title: str

    summary: str

    is_featured: bool

    published_at: datetime | None = None


# =========================================================
# ARTICLE DETAIL RESPONSE
# =========================================================


class HealthArticleDetailResponse(
    BaseModel
):
    id: uuid.UUID

    category: HealthArticleCategory

    slug: str

    title: str

    summary: str

    content: str

    key_points: list[
        str
    ] = Field(
        default_factory=list
    )

    professional_advice_note: str

    source_name: str | None = None

    source_url: str | None = None

    is_featured: bool

    published_at: datetime | None = None