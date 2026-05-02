from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.applications import router as applications_router
from routes.insights import router as insights_router
from routes.logs import router as logs_router

app = FastAPI(
    title="KrishiPrabandh API",
    description="Agriculture Scheme Processing Backend — Maharashtra Government Simulation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications_router)
app.include_router(insights_router)
app.include_router(logs_router)

@app.get("/", tags=["Health"])
def health():
    return {"success": True, "data": {"status": "KrishiPrabandh API is running", "version": "1.0.0"}}
