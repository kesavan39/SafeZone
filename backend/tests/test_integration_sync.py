import pytest
import asyncio
from typing import List, Dict, Any
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.simulation.physics_engine import PhysicsEngine
from app.safety.dynamic_zone_calculator import DynamicSafetyCalculator

# Simulates frontend canvas render latency
async def simulated_frontend_render(timestep_data: Dict[str, Any], render_latency_ms: float = 0.0):
    """
    Simulates frontend receiving the timestep data across network and rendering it.
    Validates synchronization by ensuring the rendered required separation matches backend.
    """
    await asyncio.sleep(render_latency_ms / 1000.0)
    
    # Frontend local validation 
    # (Checking if the mathematical engine output is correct at the frontend level)
    actual_dist = timestep_data["actual_distance"]
    req_sep = timestep_data["required_separation"]
    risk = timestep_data["risk_level"]
    
    assert req_sep > 0, "Required separation should be strictly positive"
    
    # Verify risk mapping sync
    if actual_dist > 1.3 * req_sep:
        assert risk == "SAFE"
    elif actual_dist > req_sep:
        assert risk == "WARNING"
    elif actual_dist > 0.8 * req_sep:
        assert risk == "HIGH_RISK"
    else:
        assert risk == "CRITICAL"
        
    return True

@pytest.mark.asyncio
async def test_engine_and_canvas_render_synchronization():
    """
    Validates the mathematical engine and dynamic canvas render synchronization
    across varying network latencies.
    """
    # 1. Run backend mathematical engine step
    robot_waypoints = [{"x": 4.0, "y": 7.5, "speed": 2.0}, {"x": 5.0, "y": 7.5, "speed": 2.0}]
    human_waypoints = [{"x": 4.5, "y": 7.5, "speed": 1.2}, {"x": 5.5, "y": 7.5, "speed": 1.2}]
    
    # Simulate for a short duration
    result = PhysicsEngine.run_simulation(
        mode="dynamic",
        duration_seconds=2.0,
        timestep=0.1,
        robot_waypoints=robot_waypoints,
        human_waypoints=human_waypoints
    )
    
    timesteps = result["timesteps"]
    assert len(timesteps) > 0
    
    # 2. Simulate streaming to frontend with varying network latencies
    latencies_to_test_ms = [5.0, 50.0, 200.0] # LAN, 4G, high-latency satellite
    
    for latency in latencies_to_test_ms:
        tasks = []
        for ts_data in timesteps:
            tasks.append(simulated_frontend_render(ts_data, render_latency_ms=latency))
        
        results = await asyncio.gather(*tasks)
        assert all(results), f"Frontend render sync failed at latency {latency}ms"

def test_mathematical_engine_bounds():
    """
    Integration test to ensure the mathematical engine produces valid bounds
    that the frontend canvas can correctly render.
    """
    # Max speed scenario to test extreme bounds
    req_sep, breakdown = DynamicSafetyCalculator.calculate_required_separation(
        robot_speed=3.0, 
        human_speed=1.5,
        reaction_time=0.25,
        decel=0.8,
        pos_uncertainty=0.15,
        sensor_latency=0.12
    )
    
    # Verify bounds are realistic for canvas limits
    assert 2.0 < req_sep < 10.0, f"Unrealistic required separation boundary: {req_sep}m"
    assert breakdown["robot_stopping_distance"] > 1.0
    assert breakdown["human_movement_distance"] > 0.3
