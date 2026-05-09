from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.applications import router as applications_router
from app.api.v1.insights import router as insights_router
from app.api.v1.logs import router as logs_router
from app.api.v1.gr import router as gr_router
from app.api.v1.mandals import router as mandals_router
from app.api.v1.sahayaks import router as sahayaks_router
from app.api.v1.mka import router as mka_router

app = FastAPI(
    title="KrishiPrabandh API v1",
    description="Agriculture Scheme Processing Backend — Maharashtra Government Simulation",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1")
app.include_router(logs_router, prefix="/api/v1")
app.include_router(gr_router, prefix="/api/v1")
app.include_router(mandals_router, prefix="/api/v1")
app.include_router(sahayaks_router, prefix="/api/v1")
app.include_router(mka_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
def health():
    return {"success": True, "data": {"status": "KrishiPrabandh API v1 is running", "version": "2.0.0"}}
