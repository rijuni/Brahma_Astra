# ASTRA Engine — Coding Workflow & Orchestration Service

Python + FastAPI service for ASTRA coding workspace workflows, patch proposal generation, and execution coordination with ASTRA Runner.

## Responsibilities
- Workspace initialization and management.
- Coding task analysis and patch proposal generation.
- Dispatching execution jobs to the isolated ASTRA Runner service.
- Verification and test orchestration.

## Port & Health Check
- Port: `8002`
- Liveness Probe: `GET http://localhost:8002/health/live`
- Readiness Probe: `GET http://localhost:8002/health/ready`

## Configuration
- `ASTRA_ENGINE_PORT=8002`
- `ASTRA_RUNNER_URL=http://localhost:8003`
- `INTERNAL_SERVICE_KEY=...`

## Running
```bash
python -m venv .venv
pip install -e ".[test]"
uvicorn app.main:app --port 8002 --reload
```
