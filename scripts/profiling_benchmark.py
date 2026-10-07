import time
import cProfile
import pstats
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.simulation.physics_engine import PhysicsEngine

def generate_high_frequency_waypoints(num_points=1000):
    robot_waypoints = []
    human_waypoints = []
    for i in range(num_points):
        robot_waypoints.append({"x": 4.0 + (i * 0.01), "y": 7.5, "speed": 1.5})
        human_waypoints.append({"x": 14.0 - (i * 0.01), "y": 7.5, "speed": 1.0})
    return robot_waypoints, human_waypoints

def run_benchmark():
    print("--- Running High-Frequency Profiling Benchmark ---")
    robot_waypoints, human_waypoints = generate_high_frequency_waypoints(500)
    
    start_time = time.time()
    result = PhysicsEngine.run_simulation(
        mode="dynamic",
        duration_seconds=50.0,
        timestep=0.01,  # 100 Hz simulation for high-frequency testing
        robot_waypoints=robot_waypoints,
        human_waypoints=human_waypoints
    )
    end_time = time.time()
    
    total_time = end_time - start_time
    total_steps = result['summary']['total_timesteps']
    time_per_step_ms = (total_time / total_steps) * 1000 if total_steps > 0 else 0
    
    print(f"Total Simulation Time: {total_time:.4f} seconds")
    print(f"Total Timesteps: {total_steps}")
    print(f"Average Time per Step: {time_per_step_ms:.4f} ms")
    
    if time_per_step_ms < 5.0:
        print("=> SIL 2 Timing Constraint (typical < 5ms) MET.")
    else:
        print("=> SIL 2 Timing Constraint (typical < 5ms) FAILED.")

def profile_engine():
    print("\n--- Detailed cProfile ---")
    robot_waypoints, human_waypoints = generate_high_frequency_waypoints(500)
    
    profiler = cProfile.Profile()
    profiler.enable()
    
    PhysicsEngine.run_simulation(
        mode="dynamic",
        duration_seconds=50.0,
        timestep=0.01,
        robot_waypoints=robot_waypoints,
        human_waypoints=human_waypoints
    )
    
    profiler.disable()
    stats = pstats.Stats(profiler).sort_stats('cumtime')
    stats.print_stats(15)

if __name__ == "__main__":
    run_benchmark()
    profile_engine()
