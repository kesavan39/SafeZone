from fastapi import APIRouter
from app.schemas.domain import SensitivityRequest
from app.sensitivity.sensitivity_analyzer import SensitivityAnalyzer

router = APIRouter(prefix="/api/sensitivity", tags=["Sensitivity Analysis"])

@router.post("/run")
def run_sensitivity_analysis(req: SensitivityRequest):
    return SensitivityAnalyzer.run_sensitivity_sweep(
        parameter_to_vary=req.parameter_to_vary,
        min_val=req.min_value,
        max_val=req.max_value,
        steps=req.steps
    )
