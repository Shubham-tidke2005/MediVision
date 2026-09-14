from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine


app = FastAPI(
    title="MediVision AI API",
    description="Backend API for MediVision AI",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to MediVision AI API"
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "MediVision AI Backend",
    }


@app.get("/api/v1/health/database")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }