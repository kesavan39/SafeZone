import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
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
# This ensures that our React frontend can communicate with the FastAPI backend without security blockages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ERROR BOUNDARIES & GLOBAL EXCEPTION HANDLING
# ==========================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Error Boundary: Catches Pydantic validation errors (422) and formats them cleanly.
    Ensures that bad data from the frontend doesn't crash the server.
    """
    logger.error(f"Validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"message": "Data validation failed", "details": exc.errors()},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Error Boundary: Ultimate fallback for any unhandled exceptions (500).
    Prevents leaking stack traces to the client and guarantees a JSON response.
    """
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An internal server error occurred.", "details": str(exc)},
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
    """
    Root endpoint for basic service verification.
    """
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/health")
def health_check():
    """
    Health check endpoint used by Kubernetes or Docker to verify readiness.
    """
    return {"status": "healthy"}
