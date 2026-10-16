# BRAHMA + ASTRA — Native Windows Backend

> **BRAHMA** is the main intelligence platform.  
> **ASTRA** is an isolated coding and development workspace.

This monorepo contains the complete backend implementation and service boundaries. Local development runs **natively on Windows** without requiring Docker, container runtimes, or external databases.

## Architecture & Technology Stack

| Layer | Service / Subsystem | Technology | Responsibility | Local Port |
|---|---|---|---|---|
| **Application API** | `services/api` | Node.js + Express (JavaScript) | Auth, sessions, projects, conversations, Prisma ORM, audit logging, public `/api/v1` | `3000` |
| **Database** | SQLite (Dev) / PostgreSQL (Target) | Prisma ORM | Initial zero-friction SQLite (`dev.db`), PostgreSQL target for production | Local file |
| **BRAHMA Core** | `services/brahma-core` | Python 3.13 + FastAPI | Intelligence orchestration, provider abstractions (Mock, OpenAI, Anthropic, Gemini) | `8001` |
| **ASTRA Engine** | `services/astra-engine` | Python 3.13 + FastAPI | Coding workflows, workspace backend, patch proposals, test coordination | `8002` |
| **ASTRA Runner** | `services/astra-runner` | Python 3.13 / Security Boundary | Code execution service (arbitrary execution disabled by default on native Windows) | `8003` |
| **Shared Contracts** | `packages/contracts` | CommonJS / OpenAPI 3.1 | Error shapes, status models, and shared API constants | Shared |
| **Frontend** | `apps/web` | React + JavaScript + Vite | User interface (reserved for frontend milestone) | `5173` |

---

## Native Windows Quick Start

### 1. Prerequisites
- **Node.js** >= 20 (`node -v`)
- **Python** >= 3.11 (`python --version`)
- PowerShell 5.1+ / 7+

No Docker Desktop or container daemon is required.

### 2. Automated One-Command Setup
Run the native Windows setup script from PowerShell:
```powershell
.\scripts\dev-setup.ps1
```
This script automatically:
1. Checks Node.js and Python installations.
2. Installs npm dependencies in `services/api`.
3. Generates the Prisma client and applies the SQLite initial migration (`dev.db`).
4. Seeds development data (admin user: `developer@brahma-astra.local`, demo project, workspace).
5. Creates the Python virtual environment (`.venv`) and installs FastAPI, Uvicorn, Pydantic, and Pytest.
6. Validates schema compatibility.

---

## Starting Services on Windows

Start each service in a separate PowerShell terminal:

### Terminal 1 — Application API (Port 3000)
```powershell
.\scripts\start-api.ps1
```
- Liveness Probe: `http://localhost:3000/health/live`
- Readiness Probe: `http://localhost:3000/health/ready`

### Terminal 2 — BRAHMA Core (Port 8001)
```powershell
.\scripts\start-brahma-core.ps1
```
- Liveness Probe: `http://localhost:8001/health/live`
- Readiness Probe: `http://localhost:8001/health/ready`

### Terminal 3 — ASTRA Engine (Port 8002)
```powershell
.\scripts\start-astra-engine.ps1
```
- Liveness Probe: `http://localhost:8002/health/live`
- Readiness Probe: `http://localhost:8002/health/ready`

### Terminal 4 — ASTRA Runner (Port 8003)
```powershell
.\scripts\start-astra-runner.ps1
```
- Liveness Probe: `http://localhost:8003/health/live`
- Readiness Probe: `http://localhost:8003/health/ready`
- Security Status: `http://localhost:8003/api/v1/security-status`

---

## Automated Testing

Run all automated test suites across the entire monorepo natively:
```powershell
.\scripts\test-all.ps1
```
This runs:
- **Prisma Schema Parity**: Validates model and field parity between SQLite and PostgreSQL schemas.
- **Application API**: 27 unit & integration tests via Jest & Supertest.
- **BRAHMA Core**: 7 tests via Pytest.
- **ASTRA Engine**: 5 tests via Pytest.
- **ASTRA Runner**: 8 security boundary tests via Pytest.

---

## ASTRA Runner Security on Windows

In native Windows development, a standard Windows child process, Python subprocess, or restricted working directory is **not** treated as a secure sandbox.

- By default, arbitrary code execution is **STRICTLY DISABLED** (`RUNNER_EXECUTION_MODE=disabled`).
- Execution requests return a documented `execution unavailable` response (`status: "disabled"`).
- Host environment variables (database URLs, tokens, secrets) are scrubbed.
- Arbitrary code execution may only be enabled when a verified hardware/container sandbox (e.g. Windows AppContainer or dedicated microVM) is active.

---

## PostgreSQL & Production Target

SQLite is the default local development database. PostgreSQL is the target for integration testing and production.
To validate and migrate against a remote or local PostgreSQL database:
```powershell
.\scripts\migrate-postgres.ps1 -DatabaseUrl "postgresql://user:password@hostname:5432/brahma_astra?schema=public"
```
Prisma migration histories are provider-specific; SQLite migrations are not mixed with PostgreSQL migrations.
