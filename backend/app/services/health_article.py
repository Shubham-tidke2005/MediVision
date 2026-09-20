from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import (
    Session,
)

from app.repositories.health_article import (
    get_published_article_by_slug,
    get_published_articles,
)

from app.schemas.health_article import (
    HealthArticleCategory,
    HealthArticleDetailResponse,
    HealthArticleSummaryResponse,
    HealthCategoryResponse,
)


CATEGORY_DATA = [
    {
        "code":
            HealthArticleCategory
            .DIABETES_PREVENTION,

        "label":
            "Diabetes Prevention",

        "description":
            (
                "General lifestyle information "
                "related to reducing the risk of "
                "type 2 diabetes."
            ),
    },

    {
        "code":
            HealthArticleCategory
            .HYPERTENSION_AWARENESS,

        "label":
            "Blood Pressure",

        "description":
            (
                "Educational information about "
                "blood pressure awareness and "
                "healthy everyday habits."
            ),
    },

    {
        "code":
            HealthArticleCategory
            .HEALTHY_DIET,

        "label":
            "Healthy Diet",

        "description":
            (
                "General information about balanced "
                "food choices and eating habits."
            ),
    },

    {
        "code":
            HealthArticleCategory
            .SLEEP,

        "label":
            "Sleep",

        "description":
            (
                "General guidance for supporting "
                "healthy sleep habits."
            ),
    },

    {
        "code":
            HealthArticleCategory
            .EXERCISE,

        "label":
            "Exercise",

        "description":
            (
                "Educational information about "
                "regular physical activity."
            ),
    },

    {
        "code":
            HealthArticleCategory
            .VACCINATION,

        "label":
            "Vaccination",

        "description":
            (
                "General awareness about vaccination "
                "and preventive healthcare."
            ),
    },

    {
        "code":
            HealthArticleCategory
            .GENERAL_SCREENING,

        "label":
            "Health Screenings",

        "description":
            (
                "General awareness about preventive "
                "check-ups and screening discussions."
            ),
    },
]


def list_categories():
    return [
        HealthCategoryResponse(
            **item
        )

        for item
        in CATEGORY_DATA
    ]


def serialize_summary(
    article,
):
    return HealthArticleSummaryResponse(
        id=(
            article.id
        ),

        category=(
            article.category
        ),

        slug=(
            article.slug
        ),

        title=(
            article.title
        ),

        summary=(
            article.summary
        ),

        is_featured=(
            article.is_featured
        ),

        published_at=(
            article.published_at
        ),
    )


def serialize_detail(
    article,
):
    return HealthArticleDetailResponse(
        id=(
            article.id
        ),

        category=(
            article.category
        ),

        slug=(
            article.slug
        ),

        title=(
            article.title
        ),

        summary=(
            article.summary
        ),

        content=(
            article.content
        ),

        key_points=(
            article.key_points_json
            or []
        ),

        professional_advice_note=(
            article
            .professional_advice_note
        ),

        source_name=(
            article.source_name
        ),

        source_url=(
            article.source_url
        ),

        is_featured=(
            article.is_featured
        ),

        published_at=(
            article.published_at
        ),
    )


def list_health_articles(
    db: Session,
    *,
    category: HealthArticleCategory | None = None,
    featured_only: bool = False,
):
    articles = (
        get_published_articles(
            db,

            category=(
                category.value
                if category
                else None
            ),

            featured_only=(
                featured_only
            ),
        )
    )


    return [
        serialize_summary(
            article
        )

        for article
        in articles
    ]


def get_health_article(
    db: Session,
    slug: str,
):
    article = (
        get_published_article_by_slug(
            db,
            slug,
        )
    )


    if article is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Health education article not found."
            ),
        )


    return serialize_detail(
        article
    )