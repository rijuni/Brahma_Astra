# BRAHMA Core Orchestration Service

Python + FastAPI intelligence orchestration service for BRAHMA.

## Responsibilities
- Model and provider orchestration (Mock, OpenAI, Anthropic, Gemini).
- Structured task evaluation and context synthesis.
- Protected internal service-to-service communication with the Node.js Application API.

## Port & Health Check
- Port: `8001`
- Liveness Probe: `GET http://localhost:8001/health/live`
- Readiness Probe: `GET http://localhost:8001/health/ready`

## Configuration
See `.env` or set environment variables:
- `BRAHMA_CORE_PORT=8001`
- `INTERNAL_SERVICE_KEY=...`
- `AI_PROVIDER=mock` (or `openai`, `anthropic`, `gemini`)
- `OPENAI_API_KEY=...` (optional, for openai provider)
- `ANTHROPIC_API_KEY=...` (optional, for anthropic provider)
- `GEMINI_API_KEY=...` (optional, for gemini provider)

## Running
```bash
python -m venv .venv
# Activate virtual environment
pip install -e ".[test]"
uvicorn app.main:app --port 8001 --reload
```
