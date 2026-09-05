from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.core.supabase import db
from app.schemas.domain import ProjectCreate

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[Dict[str, Any]])
def get_projects():
    return db.get_all("projects")

@router.post("", response_model=Dict[str, Any])
def create_project(project: ProjectCreate):
    new_proj = db.insert("projects", project.model_dump())
    layout_data = {
        "project_id": new_proj["id"],
        "name": f"{project.name} Main Floor",
        "width": 20.0,
        "height": 15.0,
        "grid_size": 1.0
    }
    db.insert("layouts", layout_data)
    
    rule_data = {
        "project_id": new_proj["id"],
        "static_zone_radius": 2.5,
        "safety_margin": 0.30,
        "sensor_latency": 0.12,
        "position_uncertainty": 0.15,
        "speed_uncertainty": 0.10
    }
    db.insert("safety_rules", rule_data)
    return new_proj

@router.get("/{project_id}", response_model=Dict[str, Any])
def get_project(project_id: str):
    proj = db.get_by_id("projects", project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    layouts = db.filter_by("layouts", "project_id", project_id)
    rules = db.filter_by("safety_rules", "project_id", project_id)
    scenarios = db.filter_by("scenarios", "project_id", project_id)
    
    proj_copy = dict(proj)
    proj_copy["layouts"] = layouts
    proj_copy["safety_rules"] = rules[0] if rules else {}
    proj_copy["scenarios"] = scenarios
    return proj_copy

@router.delete("/{project_id}")
def delete_project(project_id: str):
    success = db.delete("projects", project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}
