from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_patient,
)

from app.core.database import (
    get_db,
)

from app.models.user import User

from app.schemas.symptom import (
    SymptomResponse,
)

from app.services.symptom import (
    get_symptom_catalog,
)


router = APIRouter(
    prefix="/symptoms",
    tags=[
        "Symptoms",
    ],
)


@router.get(
    "",
    response_model=list[
        SymptomResponse
    ],
)
def list_symptoms(
    current_user: User = Depends(
        require_patient
    ),
    db: Session = Depends(
        get_db
    ),
):
    return get_symptom_catalog(
        db
    )