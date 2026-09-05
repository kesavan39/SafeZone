import numpy as np
from typing import Dict, Any, List
from app.simulation.physics_engine import PhysicsEngine
from app.safety.dynamic_zone_calculator import DynamicSafetyCalculator

class SensitivityAnalyzer:
    """
    Performs parameter sensitivity sweeps and identifies decision-changing assumptions.
    """

    @classmethod
    def run_sensitivity_sweep(
        cls,
        parameter_to_vary: str = "robot_speed",
        min_val: float = 0.5,
        max_val: float = 3.0,
        steps: int = 6
    ) -> Dict[str, Any]:
        """
        Sweeps parameter value across [min_val, max_val] and evaluates safety outcomes.
        """
        values = np.linspace(min_val, max_val, steps)
        results_table = []
        decision_changes = []
        previous_risk = None

        default_robot_speed = 1.8
        default_human_speed = 1.2
        default_reaction_time = 0.25
        default_decel = 1.2
        default_margin = 0.30
        default_uncertainty = 0.15

        for val in values:
            val_float = float(round(val, 2))
            
            r_speed = val_float if parameter_to_vary == "robot_speed" else default_robot_speed
            h_speed = val_float if parameter_to_vary == "human_speed" else default_human_speed
            r_time = val_float if parameter_to_vary == "reaction_time" else default_reaction_time
            decel = val_float if parameter_to_vary == "decel" else default_decel
            margin = val_float if parameter_to_vary == "safety_margin" else default_margin
            uncertainty = val_float if parameter_to_vary == "position_uncertainty" else default_uncertainty

            # Run representative simulation step
            sim_res = PhysicsEngine.run_simulation(
                mode="dynamic",
                duration_seconds=15.0,
                timestep=0.2,
                robot_params={"max_speed": r_speed, "accel": 0.8, "decel": decel, "reaction_time": r_time},
                human_params={"speed": h_speed},
                safety_rules={
                    "static_zone_radius": 2.5,
                    "safety_margin": margin,
                    "sensor_latency": 0.12,
                    "position_uncertainty": uncertainty
                }
            )

            summary = sim_res["summary"]
            min_dist = summary["min_distance_m"]
            unsafe_events = summary["num_unsafe_events"]

            # Evaluate sample dynamic separation
            s_req, _ = DynamicSafetyCalculator.calculate_required_separation(
                robot_speed=r_speed,
                human_speed=h_speed,
                reaction_time=r_time,
                decel=decel,
                safety_margin=margin,
                pos_uncertainty=uncertainty
            )
            risk_level, rec_action = DynamicSafetyCalculator.classify_risk(min_dist, s_req)

            entry = {
                "parameter": parameter_to_vary,
                "value": val_float,
                "robot_speed": r_speed,
                "human_speed": h_speed,
                "required_separation_m": round(s_req, 3),
                "min_distance_m": min_dist,
                "risk_level": risk_level,
                "num_unsafe_events": unsafe_events,
                "recommended_action": rec_action
            }
            results_table.append(entry)

            if previous_risk is not None and previous_risk != risk_level:
                decision_changes.append(
                    f"CRITICAL BOUNDARY: When {parameter_to_vary} reaches {val_float}, safety decision transitions from {previous_risk} to {risk_level}."
                )
            previous_risk = risk_level

        return {
            "parameter_varied": parameter_to_vary,
            "min_val": min_val,
            "max_val": max_val,
            "steps": steps,
            "sweep_data": results_table,
            "decision_changing_assumptions": decision_changes
        }
