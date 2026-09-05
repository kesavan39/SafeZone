from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.core.supabase import db
from app.simulation.physics_engine import PhysicsEngine

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

@router.get("/project/{project_id}")
def get_scenarios(project_id: str):
    return db.filter_by("scenarios", "project_id", project_id)

@router.post("/run/{scenario_id}")
def run_scenario(scenario_id: str):
    scenario = db.get_by_id("scenarios", scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    scen_type = scenario.get("scenario_type", "normal")
    
    if scen_type == "path_crossing":
        robot_wp = [{"x": 4.0, "y": 7.5, "speed": 1.8}, {"x": 10.0, "y": 7.5, "speed": 1.8}]
        human_wp = [{"x": 7.5, "y": 2.0, "speed": 1.4}, {"x": 7.5, "y": 12.0, "speed": 1.4}]
    elif scen_type == "layout_change":
        robot_wp = [{"x": 4.0, "y": 7.5, "speed": 1.5}, {"x": 8.0, "y": 7.5, "speed": 1.5}]
        human_wp = [{"x": 9.0, "y": 7.5, "speed": 1.2}, {"x": 9.5, "y": 7.5, "speed": 1.0}]
    else: # normal
        robot_wp = [{"x": 4.0, "y": 7.5, "speed": 1.5}, {"x": 7.5, "y": 7.5, "speed": 1.5}]
        human_wp = [{"x": 14.0, "y": 7.5, "speed": 1.0}, {"x": 12.0, "y": 7.5, "speed": 1.0}]

    dynamic_res = PhysicsEngine.run_simulation(
        mode="dynamic",
        duration_seconds=20.0,
        timestep=0.1,
        robot_waypoints=robot_wp,
        human_waypoints=human_wp
    )
    
    static_res = PhysicsEngine.run_simulation(
        mode="static",
        duration_seconds=20.0,
        timestep=0.1,
        robot_waypoints=robot_wp,
        human_waypoints=human_wp
    )

    return {
        "scenario": scenario,
        "dynamic_result": dynamic_res,
        "static_result": static_res
    }
