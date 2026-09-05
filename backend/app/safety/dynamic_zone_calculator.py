import math
from typing import Dict, Any, Tuple

class DynamicSafetyCalculator:
    """
    Dynamic Human-Robot Safety Separation Calculator.
    Computes required dynamic separation distance based on robot velocity,
    human velocity, system reaction time, deceleration, safety margin,
    and sensor/measurement uncertainty.
    """

    @staticmethod
    def calculate_robot_stopping_distance(speed: float, reaction_time: float, decel: float) -> float:
        """
        D_robot_stop = (v_r * t_reaction) + (v_r^2 / (2 * a_decel))
        """
        if speed <= 0:
            return 0.0
        decel_effective = max(0.1, decel)
        reaction_dist = speed * max(0.0, reaction_time)
        braking_dist = (speed ** 2) / (2.0 * decel_effective)
        return reaction_dist + braking_dist

    @staticmethod
    def calculate_human_movement_distance(human_speed: float, reaction_time: float, stopping_time: float = 0.5) -> float:
        """
        D_human_move = v_h * (t_reaction + t_stopping)
        """
        return max(0.0, human_speed) * (max(0.0, reaction_time) + max(0.0, stopping_time))

    @staticmethod
    def calculate_uncertainty_margin(
        robot_speed: float,
        human_speed: float,
        pos_uncertainty: float,
        sensor_latency: float
    ) -> float:
        """
        U_total = sqrt(sigma_human^2 + sigma_robot^2) + (v_r + v_h) * delta_t_latency
        Assumes robot_pos_uncertainty is approx 0.05m and human_pos_uncertainty is pos_uncertainty.
        """
        sigma_robot = 0.05
        sigma_human = max(0.0, pos_uncertainty)
        spatial_uncertainty = math.sqrt(sigma_robot**2 + sigma_human**2)
        latency_uncertainty = (max(0.0, robot_speed) + max(0.0, human_speed)) * max(0.0, sensor_latency)
        return spatial_uncertainty + latency_uncertainty

    @classmethod
    def calculate_required_separation(
        cls,
        robot_speed: float,
        human_speed: float,
        reaction_time: float,
        decel: float,
        safety_margin: float = 0.30,
        pos_uncertainty: float = 0.15,
        sensor_latency: float = 0.12,
        missing_data: bool = False
    ) -> Tuple[float, Dict[str, float]]:
        """
        Returns (total_required_separation, components_breakdown)
        """
        d_robot_stop = cls.calculate_robot_stopping_distance(robot_speed, reaction_time, decel)
        d_human_move = cls.calculate_human_movement_distance(human_speed, reaction_time)
        u_margin = cls.calculate_uncertainty_margin(robot_speed, human_speed, pos_uncertainty, sensor_latency)
        
        fallback_extra = 1.0 if missing_data else 0.0
        s_req = d_robot_stop + d_human_move + safety_margin + u_margin + fallback_extra
        
        breakdown = {
            "robot_stopping_distance": round(d_robot_stop, 3),
            "human_movement_distance": round(d_human_move, 3),
            "safety_margin": round(safety_margin, 3),
            "uncertainty_margin": round(u_margin, 3),
            "fallback_buffer": round(fallback_extra, 3),
            "total_required_separation": round(s_req, 3)
        }
        return s_req, breakdown

    @classmethod
    def classify_risk(
        cls,
        actual_distance: float,
        required_separation: float
    ) -> Tuple[str, str]:
        """
        Classifies risk into SAFE, WARNING, HIGH_RISK, or CRITICAL.
        Returns (risk_level, recommended_action)
        """
        if actual_distance > 1.3 * required_separation:
            return "SAFE", "Continue normal robot operation at full planned velocity."
        elif actual_distance > required_separation:
            return "WARNING", "Maintain active tracking. Issue visual/audible alert to operator."
        elif actual_distance > 0.8 * required_separation:
            return "HIGH_RISK", "Reduce robot speed by 50% immediately to increase reaction window."
        else:
            return "CRITICAL", "Trigger emergency robot stop (Category 0/1 Stop) immediately."

    @classmethod
    def calculate_confidence(
        cls,
        pos_uncertainty: float,
        sensor_latency: float,
        missing_data: bool = False
    ) -> float:
        """
        Derives confidence rating percentage (0% to 100%).
        """
        if missing_data:
            return 50.0
        penalty = (pos_uncertainty * 100.0) + (sensor_latency * 150.0)
        confidence = max(40.0, min(99.0, 98.0 - penalty))
        return round(confidence, 1)

    @classmethod
    def generate_explanation(
        cls,
        risk_level: str,
        actual_distance: float,
        required_separation: float,
        robot_speed: float,
        human_speed: float,
        pos_uncertainty: float,
        confidence: float,
        recommended_action: str,
        missing_data_desc: str = None
    ) -> str:
        """
        Produces human-readable, transparent explanation for risk auditors.
        """
        lines = [
            f"=== SAFETY RISK EVALUATION: {risk_level} ===",
            f"Current Separation Distance: {actual_distance:.2f} m",
            f"Dynamic Required Separation: {required_separation:.2f} m",
            f"Robot Operating Speed: {robot_speed:.2f} m/s",
            f"Human Movement Speed: {human_speed:.2f} m/s",
            f"Measurement Uncertainty: ±{pos_uncertainty:.2f} m",
            f"System Decision Confidence: {confidence:.1f}%"
        ]
        if missing_data_desc:
            lines.append(f"DATA LIMITATION WARNING: {missing_data_desc}. Applied +1.0m conservative fallback buffer.")
        
        if risk_level == "SAFE":
            lines.append("Reason: Current separation comfortably exceeds the dynamic safety threshold.")
        elif risk_level == "WARNING":
            lines.append("Reason: Current separation is approaching the dynamic required boundary.")
        elif risk_level == "HIGH_RISK":
            lines.append("Reason: Current separation is below calculated required safety boundary!")
        else:
            lines.append("Reason: Severe proximity breach! Distance is within emergency stopping range!")

        lines.append(f"Recommended Action: {recommended_action}")
        return "\n".join(lines)
