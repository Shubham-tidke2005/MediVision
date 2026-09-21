from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.api.v1.auth import (
    router as auth_router,
)

from app.api.v1.health import (
    router as health_router,
)

from app.api.v1.access_test import (
    router as access_test_router,
)

from app.api.v1.patients import (
    router as patients_router,
)

from app.api.v1.doctors import (
    router as doctors_router,
)

from app.api.v1.availability import (
    router as availability_router,
)

from app.api.v1.discovery import (
    router as discovery_router,
)

from app.api.v1.recommended_doctors import (
    router as recommended_doctors_router,
)

from app.api.v1.appointments import (
    router as appointments_router,
)

from app.api.v1.encounters import (
    router as encounters_router,
)

from app.api.v1.diagnoses import (
    router as diagnoses_router,
)

from app.api.v1.prescriptions import (
    router as prescriptions_router,
)

from app.api.v1.medical_documents import (
    router as medical_documents_router,
)

from app.api.v1.medical_access import (
    router as medical_access_router,
)

from app.api.v1.medication_reminders import (
    router as medication_reminders_router,
)

from app.api.routes.symptom import (
    router as symptom_router,
)

from app.api.routes.ai import (
    router as ai_router,
)
from app.api.routes.diet import (
    router as diet_router,
)

from app.api.routes.activity import (
    router as activity_router,
)

from app.api.routes.health_education import (
    router as health_education_router,
)

from app.api.routes.nearby import (
    router as nearby_router,
)

# =========================================================
# FASTAPI APPLICATION
# =========================================================


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        settings.frontend_url,
    ],

    allow_credentials=True,

    allow_methods=[
        "*",
    ],

    allow_headers=[
        "*",
    ],
)


# =========================================================
# ROUTERS
# =========================================================


app.include_router(
    auth_router,
    prefix="/api/v1",
)


app.include_router(
    access_test_router,
    prefix="/api/v1",
)


app.include_router(
    patients_router,
    prefix="/api/v1",
)


app.include_router(
    doctors_router,
    prefix="/api/v1",
)


app.include_router(
    availability_router,
    prefix="/api/v1",
)


app.include_router(
    discovery_router,
    prefix="/api/v1",
)


app.include_router(
    recommended_doctors_router,
    prefix="/api/v1",
)


app.include_router(
    appointments_router,
    prefix="/api/v1",
)


app.include_router(
    encounters_router,
    prefix="/api/v1",
)


app.include_router(
    diagnoses_router,
    prefix="/api/v1",
)


app.include_router(
    prescriptions_router,
    prefix="/api/v1",
)


app.include_router(
    medical_documents_router,
    prefix="/api/v1",
)


app.include_router(
    medical_access_router,
    prefix="/api/v1",
)


app.include_router(
    medication_reminders_router,
    prefix="/api/v1",
)


app.include_router(
    health_router,
    prefix="/api/v1",
)


app.include_router(
    symptom_router,
    prefix="/api/v1",
)


app.include_router(
    ai_router,
    prefix="/api/v1",
)

app.include_router(
    diet_router
)

app.include_router(
    activity_router
)

app.include_router(
    health_education_router
)

app.include_router(
    nearby_router
)