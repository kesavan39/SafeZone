from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from typing import Dict, Any
from app.core.supabase import db
from app.reports.report_generator import ReportGenerator
from app.simulation.physics_engine import PhysicsEngine

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/generate/{project_id}")
def generate_report(project_id: str):
    proj = db.get_by_id("projects", project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    sim_res = PhysicsEngine.run_simulation(mode="dynamic", duration_seconds=20.0, timestep=0.1)
    
    md_content = ReportGenerator.generate_markdown_report(
        project_data=proj,
        sim_summary=sim_res["summary"],
        risk_events=sim_res["risk_events"]
    )

    report_record = {
        "project_id": project_id,
        "title": f"Safety Compliance Report - {proj['name']}",
        "file_format": "markdown",
        "content_json": {"markdown": md_content}
    }
    saved_report = db.insert("reports", report_record)
    return {
        "report_id": saved_report["id"],
        "title": saved_report["title"],
        "markdown_content": md_content
    }

@router.get("/download/{project_id}")
def download_report_markdown(project_id: str):
    proj = db.get_by_id("projects", project_id) or {"name": "Contractor Project", "customer_name": "Factory Customer"}
    sim_res = PhysicsEngine.run_simulation(mode="dynamic", duration_seconds=20.0, timestep=0.1)
    md_content = ReportGenerator.generate_markdown_report(
        project_data=proj,
        sim_summary=sim_res["summary"],
        risk_events=sim_res["risk_events"]
    )
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=safety_report_{project_id}.md"}
    )
