# Dynamic Human-Robot Safety Zone Simulator

A real-time, physics-based decision support simulator designed to prevent zero-safety compromises and reduce unnecessary robot halts in contract manufacturing environments.

## API Endpoints

The FastAPI backend exposes the following REST API endpoints:

### General
* `GET /`: Root endpoint to check service status.
* `GET /api/health`: Health check for Kubernetes/Docker readiness.

### Projects & Layouts
* `GET /api/projects`: List all simulation projects.
* `POST /api/projects`: Create a new project.
* `GET /api/layouts/{project_id}`: Retrieve the 2D layout associated with a project (Robots, Workstations).

### Simulation & Safety Engine
* `POST /api/simulation/run`: Runs the time-series step-by-step safety simulation. Accepts robot and human trajectories.
* `POST /api/sensitivity/sweep`: Returns boundary matrices for parameter sensitivity analysis (used in Jupyter Notebooks).
* `GET /api/scenarios`: List predefined testing scenarios.

### Reports & Feedback
* `POST /api/reports/generate`: Generates the ISO 13849 standard compliance markdown report.
* `POST /api/feedback/submit`: Submit stakeholder validation feedback.

---

## Database Schema (Supabase / PostgreSQL)

The system is backed by a PostgreSQL database with the following core entities:

* **Projects Table**: Stores metadata for safety projects (id, name, created_at, client_id).
* **Layouts Table**: Stores physical bounds and element configurations (id, project_id, elements_json).
* **Scenarios Table**: Holds predefined use cases such as 'Path Crossing' or 'Normal Production' (id, name, description, waypoints_json).
* **SimulationLogs Table**: Archives the generated timestep outputs, including near-miss events and required separation graphs.

*(For full schema definition, see `database/001_initial_schema.sql`)*

---

## Testing & Error Handling

### Unit & Integration Testing
We utilize `pytest` and `pytest-asyncio` for comprehensive testing:
* **Mathematical Engine Testing**: Unit tests validate the precise deterministic bounds of `DynamicSafetyCalculator`.
* **Sync Validation Testing**: The integration suite (`backend/tests/test_integration_sync.py`) verifies that the calculated bounds from the python backend are properly synchronized with the frontend canvas simulation under varying simulated network latencies (e.g., LAN, 4G, Satellite). 

To run tests:
```bash
cd backend
python -m pytest tests/ -v
```

### Error Boundaries (Robustness)
The FastAPI backend enforces strict error boundaries to ensure the simulator never crashes silently, guaranteeing safe degradation:
1. **RequestValidation Boundary**: Unprocessable or missing parameters (e.g., missing human position) trigger a `422 Unprocessable Entity` caught by the global validation handler. In the simulation core, this defaults to a conservative fallback buffer (`+1.0m`).
2. **Global Exception Fallback**: A root-level `Exception` handler catches unexpected 500 server errors, masking stack traces from the client while guaranteeing a clean JSON response.
3. **Frontend Error Boundaries**: The React UI implements `componentDidCatch` / `ErrorBoundaries` to prevent white-screens if the Canvas rendering engine fails due to data desynchronization.

---

## Getting Started

See the detailed `PROJECT_COMPLETE_REPORT.txt` for full setup instructions and architectural details.
