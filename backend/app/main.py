from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.core.config import settings

from app.api.v1.access_test import (
    router as access_test_router,
)

from app.api.v1.patients import (
    router as patients_router,
)

from app.api.v1.doctors import (
    router as doctors_router,
)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    health_router,
    prefix="/api/v1",
)

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