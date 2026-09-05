from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.core.supabase import db
from app.schemas.domain import SimulationRunRequest
from app.simulation.physics_engine import PhysicsEngine

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/run")
def run_simulation(req: SimulationRunRequest):
    rules_list = db.filter_by("safety_rules", "project_id", req.project_id)
    rules = rules_list[0] if rules_list else {}

    s_rules = {
        "static_zone_radius": rules.get("static_zone_radius", 2.5),
        "safety_margin": req.safety_margin or rules.get("safety_margin", 0.30),
        "sensor_latency": rules.get("sensor_latency", 0.12),
        "position_uncertainty": req.position_uncertainty or rules.get("position_uncertainty", 0.15),
        "speed_uncertainty": rules.get("speed_uncertainty", 0.10)
    }

    r_params = {
        "max_speed": req.robot_speed or 1.8,
        "accel": 0.8,
        "decel": req.decel or 1.2,
        "reaction_time": req.reaction_time or 0.25
    }
    h_params = {
        "speed": req.human_speed or 1.2
    }

    sim_result = PhysicsEngine.run_simulation(
        mode=req.mode,
        duration_seconds=req.duration_seconds,
        timestep=req.timestep,
        robot_params=r_params,
        human_params=h_params,
        safety_rules=s_rules,
        missing_data_type=req.missing_data_type
    )

    run_record = {
        "project_id": req.project_id,
        "scenario_id": req.scenario_id,
        "mode": req.mode,
        "duration_seconds": req.duration_seconds,
        "timestep": req.timestep,
        "status": "completed",
        "summary_metrics": sim_result["summary"]
    }
    saved_run = db.insert("simulation_runs", run_record)
    
    for ev in sim_result["risk_events"]:
        ev_copy = dict(ev)
        ev_copy["simulation_run_id"] = saved_run["id"]
        db.insert("risk_events", ev_copy)

    sim_result["run_id"] = saved_run["id"]
    return sim_result

@router.get("/{run_id}")
def get_simulation_run(run_id: str):
    run = db.get_by_id("simulation_runs", run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Simulation run not found")
    events = db.filter_by("risk_events", "simulation_run_id", run_id)
    r_copy = dict(run)
    r_copy["risk_events"] = events
    return r_copy
