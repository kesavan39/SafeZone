import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import projects, layouts, simulation, scenarios, sensitivity, feedback, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("safety_simulator")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dynamic Human-Robot Safety Zone Simulator REST API"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(projects.router)
app.include_router(layouts.router)
app.include_router(simulation.router)
app.include_router(scenarios.router)
app.include_router(sensitivity.router)
app.include_router(feedback.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
