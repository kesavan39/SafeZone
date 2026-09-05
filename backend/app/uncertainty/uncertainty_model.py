import numpy as np
from typing import Dict, Any, Tuple

class UncertaintyEngine:
    """
    Simulates measurement noise, sensor latency jitter, and explicit missing data fallbacks.
    """

    @staticmethod
    def apply_gaussian_noise(x: float, y: float, sigma: float = 0.15) -> Tuple[float, float]:
        """
        Adds Gaussian measurement noise N(0, sigma^2) to (x, y) spatial coordinates.
        """
        noise_x = float(np.random.normal(0, sigma))
        noise_y = float(np.random.normal(0, sigma))
        return round(x + noise_x, 3), round(y + noise_y, 3)

    @staticmethod
    def handle_missing_data(
        data_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Detects missing telemetry attributes and constructs explicit warning & fallback recommendations.
        """
        missing_fields = []
        warnings = []
        fallback_actions = []

        if "human_pos" not in data_payload or data_payload["human_pos"] is None:
            missing_fields.append("human_position")
            warnings.append("Human location sensor signal lost or unreadable!")
            fallback_actions.append("Apply maximum conservative +1.0m safety radius buffer around robot reach envelope.")

        if "robot_speed" not in data_payload or data_payload["robot_speed"] is None:
            missing_fields.append("robot_speed")
            warnings.append("Robot joint encoder velocity data unavailable.")
            fallback_actions.append("Assume worst-case maximum robot speed (V_max = 1.8 m/s).")

        if "path" not in data_payload or not data_payload.get("path"):
            missing_fields.append("robot_path")
            warnings.append("Robot trajectory waypoints are undefined!")
            fallback_actions.append("Simulation execution halted. Define at least 2 valid waypoints.")

        is_degraded = len(missing_fields) > 0
        confidence = 50.0 if is_degraded else 95.0

        return {
            "is_data_missing": is_degraded,
            "missing_fields": missing_fields,
            "warnings": warnings,
            "fallback_actions": fallback_actions,
            "system_confidence_score": confidence
        }
