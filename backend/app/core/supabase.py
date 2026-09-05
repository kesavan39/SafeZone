import os
import uuid
from typing import Dict, Any, List, Optional
from app.core.config import settings

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_ANON_KEY
        self.is_real = "supabase.co" in self.url and not "mock.supabase.co" in self.url
        self.client = None
        
        if self.is_real:
            try:
                from supabase import create_client
                self.client = create_client(self.url, self.key)
            except Exception as e:
                print(f"Warning: Failed to connect to Supabase: {e}. Falling back to in-memory store.")
                self.is_real = False

        # In-Memory Database fallback for offline/development mode
        self._in_memory_db: Dict[str, List[Dict[str, Any]]] = {
            "projects": [
                {
                    "id": "11111111-1111-1111-1111-111111111111",
                    "name": "Customer A - Assembly Line",
                    "customer_name": "Contractor Alpha Corp",
                    "description": "High precision electronics assembly workcell with dynamic safety zones.",
                    "created_at": "2026-09-05T10:00:00Z",
                    "updated_at": "2026-09-05T10:00:00Z"
                },
                {
                    "id": "22222222-2222-2222-2222-222222222222",
                    "name": "Customer B - Welding Line",
                    "customer_name": "Automotive Supplies Ltd",
                    "description": "Robotic arc welding station with human quality inspection zones.",
                    "created_at": "2026-09-05T11:00:00Z",
                    "updated_at": "2026-09-05T11:00:00Z"
                },
                {
                    "id": "33333333-3333-3333-3333-333333333333",
                    "name": "Customer C - Packaging Line",
                    "customer_name": "PharmaPack Logistics",
                    "description": "High speed pick and place robot with human pallet loading operators.",
                    "created_at": "2026-09-05T12:00:00Z",
                    "updated_at": "2026-09-05T12:00:00Z"
                }
            ],
            "layouts": [
                {
                    "id": "aaaaaaa1-1111-1111-1111-111111111111",
                    "project_id": "11111111-1111-1111-1111-111111111111",
                    "name": "Assembly Cell Main Floor",
                    "width": 20.0,
                    "height": 15.0,
                    "grid_size": 1.0
                }
            ],
            "layout_objects": [
                {
                    "id": "obj-robot-111",
                    "layout_id": "aaaaaaa1-1111-1111-1111-111111111111",
                    "type": "robot",
                    "name": "Robot R-001 (Articulated Arm)",
                    "x": 5.0,
                    "y": 7.5,
                    "width": 1.5,
                    "height": 1.5,
                    "rotation": 0.0
                },
                {
                    "id": "obj-human-111",
                    "layout_id": "aaaaaaa1-1111-1111-1111-111111111111",
                    "type": "workstation",
                    "name": "Operator Workstation W-1",
                    "x": 12.0,
                    "y": 7.5,
                    "width": 1.5,
                    "height": 1.5,
                    "rotation": 0.0
                },
                {
                    "id": "obj-conv-111",
                    "layout_id": "aaaaaaa1-1111-1111-1111-111111111111",
                    "type": "conveyor",
                    "name": "Main Feed Conveyor",
                    "x": 5.0,
                    "y": 3.0,
                    "width": 10.0,
                    "height": 1.0,
                    "rotation": 0.0
                },
                {
                    "id": "obj-obs-111",
                    "layout_id": "aaaaaaa1-1111-1111-1111-111111111111",
                    "type": "obstacle",
                    "name": "Safety Pillar Ob-1",
                    "x": 9.0,
                    "y": 10.0,
                    "width": 1.0,
                    "height": 1.0,
                    "rotation": 0.0
                }
            ],
            "robots": [
                {
                    "id": "bot-001",
                    "layout_object_id": "obj-robot-111",
                    "max_speed": 1.8,
                    "accel": 0.8,
                    "decel": 1.2,
                    "reaction_time": 0.25,
                    "stopping_time": 0.75,
                    "reach_radius": 1.2,
                    "safety_category": "Category 3 / SIL 2"
                }
            ],
            "humans": [
                {
                    "id": "hum-001",
                    "layout_object_id": "obj-human-111",
                    "speed": 1.2,
                    "task_name": "Manual Visual Inspection",
                    "task_type": "Inspection",
                    "risk_classification": "Medium"
                }
            ],
            "paths": [
                {
                    "id": "path-robot-1",
                    "entity_type": "robot",
                    "entity_id": "bot-001",
                    "waypoints": [
                        {"x": 4.0, "y": 7.5, "speed": 1.5},
                        {"x": 7.5, "y": 7.5, "speed": 1.8},
                        {"x": 7.5, "y": 10.0, "speed": 1.2},
                        {"x": 4.0, "y": 10.0, "speed": 1.0}
                    ]
                },
                {
                    "id": "path-human-1",
                    "entity_type": "human",
                    "entity_id": "hum-001",
                    "waypoints": [
                        {"x": 14.0, "y": 7.5, "speed": 1.0},
                        {"x": 10.0, "y": 7.5, "speed": 1.2},
                        {"x": 8.0, "y": 7.5, "speed": 1.3},
                        {"x": 14.0, "y": 7.5, "speed": 1.0}
                    ]
                }
            ],
            "safety_rules": [
                {
                    "id": "rule-001",
                    "project_id": "11111111-1111-1111-1111-111111111111",
                    "static_zone_radius": 2.5,
                    "safety_margin": 0.30,
                    "sensor_latency": 0.12,
                    "position_uncertainty": 0.15,
                    "speed_uncertainty": 0.10,
                    "slowdown_threshold_factor": 1.0,
                    "stop_threshold_factor": 0.8
                }
            ],
            "scenarios": [
                {
                    "id": "scen-001",
                    "project_id": "11111111-1111-1111-1111-111111111111",
                    "title": "Scenario 1 - Normal Production",
                    "description": "Human operator remains near workstation while robot executes standard cycle.",
                    "scenario_type": "normal",
                    "config": {"robot_speed_mult": 1.0, "human_speed_mult": 1.0}
                },
                {
                    "id": "scen-002",
                    "project_id": "11111111-1111-1111-1111-111111111111",
                    "title": "Scenario 2 - Human Crosses Robot Path",
                    "description": "Human operator crosses trajectory of operating robot to fetch part bin.",
                    "scenario_type": "path_crossing",
                    "config": {"human_crosses_trajectory": True}
                },
                {
                    "id": "scen-003",
                    "project_id": "11111111-1111-1111-1111-111111111111",
                    "title": "Scenario 3 - Layout Change",
                    "description": "Workstation shifted 3 meters closer to robot arm envelope.",
                    "scenario_type": "layout_change",
                    "config": {"workstation_shift_x": -3.0}
                }
            ],
            "simulation_runs": [],
            "risk_events": [],
            "user_feedback": [],
            "reports": []
        }

    def get_all(self, table: str) -> List[Dict[str, Any]]:
        if self.is_real and self.client:
            res = self.client.table(table).select("*").execute()
            return res.data
        return self._in_memory_db.get(table, [])

    def filter_by(self, table: str, column: str, value: Any) -> List[Dict[str, Any]]:
        if self.is_real and self.client:
            res = self.client.table(table).select("*").eq(column, value).execute()
            return res.data
        items = self._in_memory_db.get(table, [])
        return [i for i in items if str(i.get(column)) == str(value)]

    def get_by_id(self, table: str, record_id: str) -> Optional[Dict[str, Any]]:
        items = self.filter_by(table, "id", record_id)
        return items[0] if items else None

    def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in data:
            data["id"] = str(uuid.uuid4())
        if self.is_real and self.client:
            res = self.client.table(table).insert(data).execute()
            return res.data[0] if res.data else data
        if table not in self._in_memory_db:
            self._in_memory_db[table] = []
        self._in_memory_db[table].append(data)
        return data

    def update(self, table: str, record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.is_real and self.client:
            res = self.client.table(table).update(data).eq("id", record_id).execute()
            return res.data[0] if res.data else None
        items = self._in_memory_db.get(table, [])
        for i in items:
            if str(i.get("id")) == str(record_id):
                i.update(data)
                return i
        return None

    def delete(self, table: str, record_id: str) -> bool:
        if self.is_real and self.client:
            self.client.table(table).delete().eq("id", record_id).execute()
            return True
        items = self._in_memory_db.get(table, [])
        self._in_memory_db[table] = [i for i in items if str(i.get("id")) != str(record_id)]
        return True

db = SupabaseService()
