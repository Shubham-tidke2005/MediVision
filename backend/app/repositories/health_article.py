from sqlalchemy import (
    select,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.health_article import (
    HealthArticle,
)


def get_published_articles(
    db: Session,
    *,
    category: str | None = None,
    featured_only: bool = False,
):
    statement = (
        select(
            HealthArticle
        )
        .where(
            HealthArticle.status
            == "PUBLISHED"
        )
    )


    if category is not None:
        statement = (
            statement.where(
                HealthArticle.category
                == category
            )
        )


    if featured_only:
        statement = (
            statement.where(
                HealthArticle.is_featured.is_(
                    True
                )
            )
        )


    statement = (
        statement.order_by(
            HealthArticle.is_featured.desc(),
            HealthArticle.published_at.desc(),
            HealthArticle.title.asc(),
        )
    )


    return list(
        db.scalars(
            statement
        ).all()
    )


def get_published_article_by_slug(
    db: Session,
    slug: str,
):
    return db.scalar(
        select(
            HealthArticle
        )
        .where(
            HealthArticle.slug
            == slug,

            HealthArticle.status
            == "PUBLISHED",
        )
    )