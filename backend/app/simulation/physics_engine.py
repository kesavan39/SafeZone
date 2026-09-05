import math
from typing import List, Dict, Any
from app.safety.dynamic_zone_calculator import DynamicSafetyCalculator

class PhysicsEngine:
    """
    Timestep simulation engine for moving entities (robots, humans)
    along path waypoints, performing proximity calculations and state transitions.
    """

    @staticmethod
    def interpolate_path(waypoints: List[Dict[str, float]], total_time: float, timestep: float) -> List[Dict[str, float]]:
        """
        Generates array of {x, y, speed} points for each timestep along a polyline path.
        """
        if not waypoints:
            return [{"x": 5.0, "y": 5.0, "speed": 0.0} for _ in range(int(total_time / timestep))]
        if len(waypoints) == 1:
            pt = waypoints[0]
            return [{"x": pt["x"], "y": pt["y"], "speed": pt.get("speed", 0.0)} for _ in range(int(total_time / timestep))]

        # Calculate segment lengths
        segments = []
        total_length = 0.0
        for i in range(len(waypoints) - 1):
            p1, p2 = waypoints[i], waypoints[i+1]
            dist = math.sqrt((p2["x"] - p1["x"])**2 + (p2["y"] - p1["y"])**2)
            segments.append({"p1": p1, "p2": p2, "dist": dist})
            total_length += dist

        if total_length == 0.0:
            pt = waypoints[0]
            return [{"x": pt["x"], "y": pt["y"], "speed": pt.get("speed", 0.0)} for _ in range(int(total_time / timestep))]

        num_steps = int(total_time / timestep)
        trajectory = []
        
        # Determine movement speed across path
        avg_speed = waypoints[0].get("speed", 1.2)
        cycle_duration = max(1.0, total_length / max(0.1, avg_speed))

        for step in range(num_steps):
            t = (step * timestep) % cycle_duration
            progress = t / cycle_duration # 0.0 to 1.0 along total path
            target_dist = progress * total_length

            accum = 0.0
            for seg in segments:
                if accum + seg["dist"] >= target_dist:
                    seg_ratio = (target_dist - accum) / max(0.001, seg["dist"])
                    cur_x = seg["p1"]["x"] + (seg["p2"]["x"] - seg["p1"]["x"]) * seg_ratio
                    cur_y = seg["p1"]["y"] + (seg["p2"]["y"] - seg["p1"]["y"]) * seg_ratio
                    cur_speed = seg["p1"].get("speed", avg_speed)
                    trajectory.append({"x": round(cur_x, 3), "y": round(cur_y, 3), "speed": round(cur_speed, 2)})
                    break
                accum += seg["dist"]

            if len(trajectory) <= step:
                pt = waypoints[-1]
                trajectory.append({"x": pt["x"], "y": pt["y"], "speed": pt.get("speed", 0.0)})

        return trajectory

    @classmethod
    def run_simulation(
        cls,
        mode: str = "dynamic", # "static" or "dynamic"
        duration_seconds: float = 20.0,
        timestep: float = 0.1,
        robot_waypoints: List[Dict[str, float]] = None,
        human_waypoints: List[Dict[str, float]] = None,
        robot_params: Dict[str, float] = None,
        human_params: Dict[str, float] = None,
        safety_rules: Dict[str, float] = None,
        missing_data_type: str = None
    ) -> Dict[str, Any]:
        """
        Runs complete time-series simulation step-by-step.
        """
        if robot_waypoints is None:
            robot_waypoints = [
                {"x": 4.0, "y": 7.5, "speed": 1.5},
                {"x": 7.5, "y": 7.5, "speed": 1.8},
                {"x": 7.5, "y": 10.0, "speed": 1.2},
                {"x": 4.0, "y": 10.0, "speed": 1.0}
            ]
        if human_waypoints is None:
            human_waypoints = [
                {"x": 14.0, "y": 7.5, "speed": 1.0},
                {"x": 10.0, "y": 7.5, "speed": 1.2},
                {"x": 8.0, "y": 7.5, "speed": 1.3},
                {"x": 14.0, "y": 7.5, "speed": 1.0}
            ]

        r_params = robot_params or {"max_speed": 1.8, "accel": 0.8, "decel": 1.2, "reaction_time": 0.25}
        h_params = human_params or {"speed": 1.2}
        s_rules = safety_rules or {
            "static_zone_radius": 2.5,
            "safety_margin": 0.30,
            "sensor_latency": 0.12,
            "position_uncertainty": 0.15,
            "speed_uncertainty": 0.10
        }

        robot_traj = cls.interpolate_path(robot_waypoints, duration_seconds, timestep)
        human_traj = cls.interpolate_path(human_waypoints, duration_seconds, timestep)

        timesteps_data = []
        risk_events = []
        
        last_risk_state = "SAFE"
        num_unsafe_events = 0
        num_robot_stops = 0
        total_stop_duration = 0.0
        total_restricted_duration = 0.0
        min_distance = 999.0
        near_misses = 0

        total_steps = len(robot_traj)

        for step in range(total_steps):
            t_sec = round(step * timestep, 2)
            r_pt = robot_traj[step]
            h_pt = human_traj[step]

            # Missing data override check
            missing_flag = False
            missing_desc = None
            if missing_data_type == "human_pos":
                missing_flag = True
                missing_desc = "Human position telemetry signal lost"
                h_pt = {"x": r_pt["x"] + 1.2, "y": r_pt["y"] + 1.2, "speed": 1.2} # Assume conservative near position
            elif missing_data_type == "robot_speed":
                missing_flag = True
                missing_desc = "Robot encoder speed readout unavailable"
                r_pt["speed"] = r_params["max_speed"] # Fallback to max speed

            dx = r_pt["x"] - h_pt["x"]
            dy = r_pt["y"] - h_pt["y"]
            actual_dist = math.sqrt(dx**2 + dy**2)
            if actual_dist < min_distance:
                min_distance = actual_dist

            if mode == "static":
                req_sep = s_rules.get("static_zone_radius", 2.5)
                breakdown = {"static_radius": req_sep}
            else:
                req_sep, breakdown = DynamicSafetyCalculator.calculate_required_separation(
                    robot_speed=r_pt["speed"],
                    human_speed=h_pt["speed"],
                    reaction_time=r_params["reaction_time"],
                    decel=r_params["decel"],
                    safety_margin=s_rules.get("safety_margin", 0.30),
                    pos_uncertainty=s_rules.get("position_uncertainty", 0.15),
                    sensor_latency=s_rules.get("sensor_latency", 0.12),
                    missing_data=missing_flag
                )

            risk_level, rec_action = DynamicSafetyCalculator.classify_risk(actual_dist, req_sep)
            confidence = DynamicSafetyCalculator.calculate_confidence(
                s_rules.get("position_uncertainty", 0.15),
                s_rules.get("sensor_latency", 0.12),
                missing_flag
            )

            # Metric counters
            if actual_dist < 1.0:
                near_misses += 1
            if risk_level in ["HIGH_RISK", "CRITICAL"]:
                total_restricted_duration += timestep
            if risk_level == "CRITICAL":
                total_stop_duration += timestep

            # Debounced Event generation on state transition
            if risk_level != last_risk_state:
                if risk_level in ["HIGH_RISK", "CRITICAL"]:
                    num_unsafe_events += 1
                if risk_level == "CRITICAL":
                    num_robot_stops += 1

                explanation = DynamicSafetyCalculator.generate_explanation(
                    risk_level=risk_level,
                    actual_distance=actual_dist,
                    required_separation=req_sep,
                    robot_speed=r_pt["speed"],
                    human_speed=h_pt["speed"],
                    pos_uncertainty=s_rules.get("position_uncertainty", 0.15),
                    confidence=confidence,
                    recommended_action=rec_action,
                    missing_data_desc=missing_desc
                )

                event = {
                    "timestep": step,
                    "timestamp_sec": t_sec,
                    "risk_level": risk_level,
                    "distance_actual": round(actual_dist, 3),
                    "distance_required": round(req_sep, 3),
                    "robot_pos": {"x": r_pt["x"], "y": r_pt["y"]},
                    "human_pos": {"x": h_pt["x"], "y": h_pt["y"]},
                    "robot_speed": r_pt["speed"],
                    "human_speed": h_pt["speed"],
                    "explanation": explanation,
                    "recommended_action": rec_action,
                    "confidence": confidence
                }
                risk_events.append(event)
                last_risk_state = risk_level

            timesteps_data.append({
                "step": step,
                "timestamp": t_sec,
                "robot": r_pt,
                "human": h_pt,
                "actual_distance": round(actual_dist, 3),
                "required_separation": round(req_sep, 3),
                "risk_level": risk_level,
                "confidence": confidence,
                "breakdown": breakdown
            })

        summary = {
            "mode": mode,
            "duration_seconds": duration_seconds,
            "total_timesteps": total_steps,
            "min_distance_m": round(min_distance, 3),
            "num_unsafe_events": num_unsafe_events,
            "num_robot_stops": num_robot_stops,
            "total_stop_duration_sec": round(total_stop_duration, 2),
            "restricted_production_pct": round((total_restricted_duration / duration_seconds) * 100.0, 1),
            "near_misses": near_misses,
            "total_risk_events_logged": len(risk_events)
        }

        return {
            "summary": summary,
            "timesteps": timesteps_data,
            "risk_events": risk_events
        }
