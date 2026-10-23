# BRAHMA + ASTRA — Full Stack Platform

> **BRAHMA** is the intelligence platform (Auth, Dashboard, AI Chat, Projects, Files, Settings).  
> **ASTRA** is the coding and development workspace (Engine, Runner, Workspace).

This monorepo contains the complete frontend and backend implementation. Local development runs **natively on Windows** without requiring Docker, container runtimes, or external databases.

---

## Architecture & System Overview

```mermaid
flowchart TD
    User["User Browser (React 18 + Vite)\nhttp://localhost:5173"] 
    -->|HTTP / API Proxy| NodeAPI["Node.js + Express API\nhttp://localhost:3000"]

    subgraph Internal_Private_Network ["Internal Service-to-Service (Protected by Secret Key)"]
        NodeAPI -->|POST /api/v1/tasks| PyBrahma["Python FastAPI\nBRAHMA Core (:8001)\n(AI Orchestration & LLMs)"]
        NodeAPI -->|POST /api/v1/workspaces| PyAstra["Python FastAPI\nASTRA Engine (:8002)\n(Code Analysis & Patches)"]
        PyAstra -->|Execution Request| PyRunner["Python FastAPI\nASTRA Runner (:8003)\n(Sandboxed Execution Boundary)"]
    end

    NodeAPI -->|Prisma ORM| SQLite[("Local Database\n(dev.db)")]
```

### Why Is the Backend Split Between Node.js and Python?

Each technology is assigned the job it is best suited for:

1. **Node.js + Express (`services/api` on Port `3000`) — The Front Gate & Business API**:
   - Handles high-concurrency web requests from the frontend with low latency.
   - Owns the database (**Prisma + SQLite**), user registration, password hashing (`bcrypt`), and session tokens (`JWT`).
   - Enforces security: CORS, rate limiting, and payload validation with Zod.
   - **Shields the internal services**: The browser *never* talks directly to Python. All client requests flow strictly through the Node.js API.

2. **Python + FastAPI (`brahma-core`, `astra-engine`, `astra-runner` on Ports `8001–8003`) — AI & Code Execution Engine**:
   - Python is the universal standard for AI/LLM integration (OpenAI, Anthropic Claude, Google Gemini).
   - Performs Abstract Syntax Tree (AST) code analysis, repository scanning, and git diff/patch operations.
   - Manages the isolated execution boundary.

---

## Service Inventory

| Layer | Service / Subsystem | Technology | Responsibility | Local Port |
|---|---|---|---|---|
| **Frontend** | `apps/web` | React 18 + Vite 5 (JS) | Glassmorphic UI: Auth, Dashboard, Chat, Projects, Files, Settings | `5173` |
| **Application API** | `services/api` | Node.js + Express | Auth, sessions, projects, chat, Prisma ORM, audit logs, public `/api/v1` | `3000` |
| **Database** | SQLite (Dev) / PostgreSQL (Target) | Prisma ORM | Zero-friction local SQLite (`dev.db`), PostgreSQL target for production | Local file |
| **BRAHMA Core** | `services/brahma-core` | Python 3.12+ + FastAPI | Intelligence orchestration, provider routing (Mock, OpenAI, Anthropic, Gemini) | `8001` |
| **ASTRA Engine** | `services/astra-engine` | Python 3.12+ + FastAPI | Coding workflows, workspace backend, patch proposals, test coordination | `8002` |
| **ASTRA Runner** | `services/astra-runner` | Python 3.12+ / Sandbox | Isolated execution boundary (execution disabled by default on native Windows) | `8003` |
| **Shared Contracts** | `packages/contracts` | CommonJS / OpenAPI 3.1 | Standard error shapes, status models, and shared constants | Shared |

---

## How to Run in Development (2-Terminal Setup)

You only need **two terminal windows** to run the complete platform:

### Terminal 1 — Frontend UI (Port 5173)
```powershell
npm --workspace=@brahma-astra/web run dev
```
> Live in your browser at: **http://localhost:5173/**

### Terminal 2 — Backend Services (All 4 in 1 Command)
```powershell
npm run dev:all-backend
```
*Or run the PowerShell script directly:*
```powershell
.\scripts\start-all-backend.ps1
```
> Automatically spawns all 4 backend microservices in parallel:
> 1. Node.js Application API (`:3000`)
> 2. Python BRAHMA Core (`:8001`)
> 3. Python ASTRA Engine (`:8002`)
> 4. Python ASTRA Runner (`:8003`)

---

### Pro-Tip: Fast Daily Development on BRAHMA (Phase 1)
If you are working strictly on **BRAHMA** (Login, Dashboard, Projects, Chat, Settings), you do not even need the Python services running! The Node.js API includes an automatic built-in mock AI fallback.

Just run:
```powershell
npm run dev:api
```
This starts the Node.js API (`http://localhost:3000`), which is 100% sufficient for complete frontend feature testing.

---

### Running Individual Services Manually (Optional)

If you prefer to run or debug backend services individually:

* **Node.js API (`:3000`)**:
  ```powershell
  npm run dev:api
  ```
* **BRAHMA Core (`:8001`)**:
  ```powershell
  npm run dev:core
  ```
* **ASTRA Engine (`:8002`)**:
  ```powershell
  npm run dev:engine
  ```
* **ASTRA Runner (`:8003`)**:
  ```powershell
  npm run dev:runner
  ```

---

## Verifying Backend Health

Run the automated live services verification script:
```powershell
node scripts/verify-services-live.js
```

Or check the health endpoints in your browser:
* **API Health**: [http://localhost:3000/health/ready](http://localhost:3000/health/ready) `{"status":"ready","database":"healthy"}`
* **BRAHMA Core**: [http://localhost:8001/health/live](http://localhost:8001/health/live) `{"status":"ok","service":"brahma-core"}`
* **ASTRA Engine**: [http://localhost:8002/health/live](http://localhost:8002/health/live) `{"status":"ok","service":"astra-engine"}`
* **ASTRA Runner**: [http://localhost:8003/health/live](http://localhost:8003/health/live) `{"status":"ok","service":"astra-runner"}`

---

## Automated Testing

Run all automated test suites across the monorepo:

### Full Monorepo Backend Test Suite
```powershell
npm test
```
*Or via PowerShell script:*
```powershell
.\scripts\test-all.ps1
```
Runs:
- **Prisma Schema Parity**: Validates model and field parity between SQLite and PostgreSQL schemas.
- **Application API**: 27 unit & integration tests via Jest & Supertest.
- **BRAHMA Core**: 7 tests via Pytest.
- **ASTRA Engine**: 5 tests via Pytest.
- **ASTRA Runner**: 8 security boundary tests via Pytest.

### Frontend Test Suite
```powershell
npm --workspace=@brahma-astra/web test
```
Runs:
- 11 unit & security tests verifying design tokens, vector lotus assets, auth client handling, and Phase 1 scope boundaries.

---

## ASTRA Runner Security on Windows

In native Windows development, standard child processes, Python subprocesses, or restricted folders are **not** treated as secure sandboxes.

- By default, arbitrary code execution is **STRICTLY DISABLED** (`RUNNER_EXECUTION_MODE=disabled`).
- Execution requests return a documented `execution unavailable` response (`status: "disabled"`).
- Host environment variables (database URLs, tokens, secrets) are scrubbed.
- Arbitrary code execution may only be enabled when a verified hardware/container sandbox (e.g. Windows AppContainer or microVM) is active.

---

## Database Configuration

* **Default (Local Development)**: SQLite (`services/api/prisma/dev.db`). No database installation or setup required.
* **Target (Integration Testing & Production)**: PostgreSQL.
  To validate or migrate against a PostgreSQL instance:
  ```powershell
  .\scripts\migrate-postgres.ps1 -DatabaseUrl "postgresql://user:password@hostname:5432/brahma_astra?schema=public"
  ```
