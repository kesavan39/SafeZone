from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ProjectCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Customer A - Assembly Line"})
    customer_name: str = Field(..., json_schema_extra={"example": "Contractor Alpha Corp"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "High precision assembly cell"})

class LayoutObjectSchema(BaseModel):
    id: Optional[str] = None
    layout_id: Optional[str] = None
    type: str = Field(..., json_schema_extra={"example": "robot"}) # robot, workstation, conveyor, obstacle, restricted_zone
    name: str = Field(..., json_schema_extra={"example": "Robot R-001"})
    x: float = Field(..., json_schema_extra={"example": 5.0})
    y: float = Field(..., json_schema_extra={"example": 7.5})
    width: float = Field(1.5, json_schema_extra={"example": 1.5})
    height: float = Field(1.5, json_schema_extra={"example": 1.5})
    rotation: float = Field(0.0, json_schema_extra={"example": 0.0})
    metadata: Optional[Dict[str, Any]] = {}

class LayoutCreate(BaseModel):
    project_id: str
    name: str = Field(..., json_schema_extra={"example": "Assembly Cell Layout"})
    width: float = 20.0
    height: float = 15.0
    grid_size: float = 1.0
    objects: List[LayoutObjectSchema] = []

class Waypoint(BaseModel):
    x: float
    y: float
    speed: float = 1.2
    dwell_time: float = 0.0

class PathCreate(BaseModel):
    entity_type: str = Field(..., json_schema_extra={"example": "robot"}) # robot or human
    entity_id: str
    waypoints: List[Waypoint]

class RobotCreate(BaseModel):
    layout_object_id: str
    max_speed: float = 1.8
    accel: float = 0.8
    decel: float = 1.2
    reaction_time: float = 0.25
    stopping_time: float = 0.75
    reach_radius: float = 1.2
    safety_category: str = "Category 3 / SIL 2"

class HumanCreate(BaseModel):
    layout_object_id: str
    speed: float = 1.2
    task_name: str = "Manual Assembly"
    task_type: str = "Inspection"
    risk_classification: str = "Medium"

class SafetyRuleCreate(BaseModel):
    project_id: str
    static_zone_radius: float = 2.5
    safety_margin: float = 0.30
    sensor_latency: float = 0.12
    position_uncertainty: float = 0.15
    speed_uncertainty: float = 0.10
    slowdown_threshold_factor: float = 1.0
    stop_threshold_factor: float = 0.8

class SimulationRunRequest(BaseModel):
    project_id: str
    scenario_id: Optional[str] = None
    mode: str = "dynamic" # "static" or "dynamic"
    duration_seconds: float = 20.0
    timestep: float = 0.1
    robot_speed: Optional[float] = None
    human_speed: Optional[float] = None
    reaction_time: Optional[float] = None
    decel: Optional[float] = None
    safety_margin: Optional[float] = None
    position_uncertainty: Optional[float] = None
    missing_data_type: Optional[str] = None # None, "human_pos", "robot_speed", "path"

class SensitivityRequest(BaseModel):
    project_id: str
    parameter_to_vary: str = "robot_speed" # robot_speed, human_speed, reaction_time, decel, safety_margin, position_uncertainty
    min_value: float = 0.5
    max_value: float = 3.0
    steps: int = 6

class FeedbackCreate(BaseModel):
    user_role: str = Field(..., json_schema_extra={"example": "Safety Officer"})
    ease_of_use: int = Field(..., ge=1, le=5)
    clarity_rating: int = Field(..., ge=1, le=5)
    confidence_rating: int = Field(..., ge=1, le=5)
    language_usability: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
