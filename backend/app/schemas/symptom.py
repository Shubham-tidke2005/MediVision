from pydantic import (
    BaseModel,
    ConfigDict,
)


class SymptomResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    code: str
    name: str
    description: str | None
    is_active: bool