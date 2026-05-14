import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api import analytics, approvals, auth, compensation, documents_ocr, farms, farmers, health, surveys, users
from config.settings import get_settings
from middleware.logging import RequestLoggingMiddleware

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="KRISHI-PRABANDH API",
    description="Survey-centric agricultural intelligence — FARMER→FARM→SURVEY→EVIDENCE→APPROVAL→COMPENSATION",
    version="3.0.0",
)

s = get_settings()
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=s.cors_origin_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(farmers.router)
app.include_router(farms.router)
app.include_router(surveys.router)
app.include_router(approvals.router)
app.include_router(analytics.router)
app.include_router(compensation.router)
app.include_router(documents_ocr.router)


@app.get("/", tags=["Health"])
def root():
    return JSONResponse(
        content={
            "success": True,
            "message": "KRISHI-PRABANDH API",
            "data": {"status": "running", "version": "3.0.0"},
        }
    )
