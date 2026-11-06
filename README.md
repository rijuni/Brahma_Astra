# FRIDAY + EDITH — Full Stack Platform

> **FRIDAY** is the intelligence platform (Auth, Dashboard, AI Chat, Projects, Files, Settings).  
> **EDITH** is the coding and development workspace (Engine, Runner, Workspace).

This monorepo contains the complete frontend and backend implementation. Local development runs **natively on Windows** without requiring Docker, container runtimes, or external databases.

---

## Architecture & System Overview

```mermaid
flowchart TD
    User["User Browser (React 18 + Vite)\nhttp://localhost:5173"] 
    -->|HTTP / API Proxy| NodeAPI["Node.js + Express API\nhttp://localhost:3000"]

    subgraph Internal_Private_Network ["Internal Service-to-Service (Protected by Secret Key)"]
        NodeAPI -->|POST /api/v1/tasks| PyFriday["Python FastAPI\nFRIDAY Core (:8001)\n(AI Orchestration & LLMs)"]
        NodeAPI -->|POST /api/v1/workspaces| PyEdith["Python FastAPI\nEDITH Engine (:8002)\n(Code Analysis & Patches)"]
        PyEdith -->|Execution Request| PyRunner["Python FastAPI\nEDITH Runner (:8003)\n(Sandboxed Execution Boundary)"]
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

2. **Python + FastAPI (`friday-core`, `edith-engine`, `edith-runner` on Ports `8001–8003`) — AI & Code Execution Engine**:
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
| **FRIDAY Core** | `services/friday-core` | Python 3.12+ + FastAPI | Intelligence orchestration, provider routing (Mock, OpenAI, Anthropic, Gemini) | `8001` |
| **EDITH Engine** | `services/edith-engine` | Python 3.12+ + FastAPI | Coding workflows, workspace backend, patch proposals, test coordination | `8002` |
| **EDITH Runner** | `services/edith-runner` | Python 3.12+ / Sandbox | Isolated execution boundary (execution disabled by default on native Windows) | `8003` |
| **Shared Contracts** | `packages/contracts` | CommonJS / OpenAPI 3.1 | Standard error shapes, status models, and shared constants | Shared |

---

## How to Run in Development (2-Terminal Setup)

### EDITH Workspace Directory

EDITH can access only directories inside the dedicated `EDITH_WORKSPACE_BASE_DIR` configured for the API. Create that directory and set the variable in the root `.env` before registering a workspace. For example, use `C:/FridayEdithWorkspaces` and place each project beneath it. The repository itself, user profile, and operating-system folders should not be used as the workspace root.

You only need **two terminal windows** to run the complete platform:

### Terminal 1 — Frontend UI (Port 5173)
```powershell
npm --workspace=@friday-edith/web run dev
```
> Live in your browser at: **http://localhost:5173/**

### Terminal 2 — Backend Services (All 4 in 1 Command)
```powershell
npm run dev:all-backend
```
> Runs all 4 backend microservices concurrently inside the **same IDE terminal** with live color-coded output:
> - `[API]` Node.js Application API (`:3000`)
> - `[CORE]` Python FRIDAY Core (`:8001`)
> - `[ENGINE]` Python EDITH Engine (`:8002`)
> - `[RUNNER]` Python EDITH Runner (`:8003`)
> 
> *Press <kbd>Ctrl</kbd>+<kbd>C</kbd> in this terminal to shut down all 4 services cleanly at once.*
> *(Optional: If you ever prefer separate detached desktop windows, run `npm run dev:all-backend:windows`)*

---

### Pro-Tip: Fast Daily Development on FRIDAY
If you are working strictly on **FRIDAY** (Login, Dashboard, Projects, Chat, Settings), you do not even need the Python services running! The Node.js API includes an automatic built-in mock AI fallback.

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
* **FRIDAY Core (`:8001`)**:
  ```powershell
  npm run dev:core
  ```
* **EDITH Engine (`:8002`)**:
  ```powershell
  npm run dev:engine
  ```
* **EDITH Runner (`:8003`)**:
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
* **FRIDAY Core**: [http://localhost:8001/health/live](http://localhost:8001/health/live) `{"status":"ok","service":"friday-core"}`
* **EDITH Engine**: [http://localhost:8002/health/live](http://localhost:8002/health/live) `{"status":"ok","service":"edith-engine"}`
* **EDITH Runner**: [http://localhost:8003/health/live](http://localhost:8003/health/live) `{"status":"ok","service":"edith-runner"}`

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
- **Application API**: 28 unit & integration tests via Jest & Supertest.
- **FRIDAY Core**: 7 tests via Pytest.
- **EDITH Engine**: 5 tests via Pytest.
- **EDITH Runner**: 8 security boundary tests via Pytest.

### Frontend Test Suite
```powershell
npm --workspace=@friday-edith/web test
```
Runs:
- 38 unit & security tests verifying design tokens, vector lotus assets, auth client handling, and Phase 1 scope boundaries.

---

## EDITH Runner Security on Windows

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
  .\scripts\migrate-postgres.ps1 -DatabaseUrl "postgresql://user:password@hostname:5432/friday_edith?schema=public"
  ```
