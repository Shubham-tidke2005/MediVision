from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    get_db,
)

from app.schemas.health_article import (
    HealthArticleCategory,
    HealthArticleDetailResponse,
    HealthArticleSummaryResponse,
    HealthCategoryResponse,
)

from app.services.health_article import (
    get_health_article,
    list_categories,
    list_health_articles,
)


router = APIRouter(
    prefix="/api/v1/health-education",
    tags=[
        "Preventive Health"
    ],
)


@router.get(
    "/categories",
    response_model=list[
        HealthCategoryResponse
    ],
)
def categories():
    return list_categories()


@router.get(
    "/articles",
    response_model=list[
        HealthArticleSummaryResponse
    ],
)
def articles(
    category: HealthArticleCategory | None = Query(
        default=None
    ),

    featured_only: bool = Query(
        default=False
    ),

    db: Session = Depends(
        get_db
    ),
):
    return list_health_articles(
        db,

        category=(
            category
        ),

        featured_only=(
            featured_only
        ),
    )


@router.get(
    "/articles/{slug}",
    response_model=(
        HealthArticleDetailResponse
    ),
)
def article(
    slug: str,

    db: Session = Depends(
        get_db
    ),
):
    return get_health_article(
        db,
        slug,
    )