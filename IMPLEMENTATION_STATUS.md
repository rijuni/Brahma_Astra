# BRAHMA + ASTRA — Implementation Status & Backend Audit Report

**Status:** Completed, Audited & Verified (Native Windows Stack)  
**Audit Date:** 2026-10-16  
**Auditor:** Lead Backend Engineer & Architect  
**Milestone:** Pre-Frontend Backend Audit & Native Windows Verification Complete

---

## 1. Executive Summary

A comprehensive, evidence-based lead engineer audit of the BRAHMA + ASTRA backend was conducted natively on Windows. All four microservices, database schemas, authentication layers, security boundaries, and automated test suites were thoroughly inspected and validated.

### Key Audit Conclusions:
1. **Native Windows Compatibility**: Docker and Docker Compose have been eliminated as required dependencies. All services run natively via Node.js (v20+), Python (v3.13), SQLite (`dev.db`), and Prisma 5.22.
2. **Automated Verification**: **47 out of 47 automated tests passed** across 5 test suites. **8 out of 8 live HTTP health and security checks passed**. Zero test failures and zero deprecation warnings.
3. **ASTRA Security Boundary**: The audit confirmed that arbitrary code execution is strictly disabled on native Windows (`RUNNER_EXECUTION_MODE=disabled`). Standard Windows subprocesses are correctly identified as non-sandboxed, preventing host compromise.
4. **Backend Readiness**: Protected routes enforce JWT authentication and resource ownership checks. The backend is stable, robust, and ready for frontend integration.

---

## 2. Service Implementation & Verification Summary

| Service / Subsystem | Directory | Tech Stack | Status | Verified Tests | Health Endpoint |
|---|---|---|---|---|---|
| **Application API** | `services/api` | Node.js + Express (JS) | **Audited & Verified** | 27 / 27 Passed (Jest) | `http://localhost:3000/health/live` |
| **Database (Dev)** | `services/api/prisma` | SQLite (`dev.db`) | **Migrated & Seeded** | Verified with Prisma 5.22 | `http://localhost:3000/health/ready` |
| **Database (Target/Prod)**| `services/api/prisma` | PostgreSQL | **Validated & Parity Confirmed** | 11 / 11 Models Matched | `scripts/migrate-postgres.ps1` |
| **BRAHMA Core** | `services/brahma-core` | Python 3.13 + FastAPI | **Audited & Verified** | 7 / 7 Passed (pytest) | `http://localhost:8001/health/live` |
| **ASTRA Engine** | `services/astra-engine` | Python 3.13 + FastAPI | **Audited & Verified** | 5 / 5 Passed (pytest) | `http://localhost:8002/health/live` |
| **ASTRA Runner** | `services/astra-runner` | Python 3.13 / Security Boundary | **Audited & Verified** | 8 / 8 Passed (pytest) | `http://localhost:8003/health/live` |
| **Shared Contracts** | `packages/contracts` | CommonJS / OpenAPI 3.1 | **Audited & Verified** | Contract validated | `docs/openapi/application-api.yaml` |
| **Frontend Skeleton** | `apps/web` | React + JS + Vite | **Reserved / Next Milestone**| Skeleton initialized | Awaiting frontend phase |

---

## 3. Verified Backend Features

### A. Application API (`services/api`)
- **Authentication & Authorization**:
  - User registration (`POST /api/v1/auth/register`) with salt-hashed passwords (bcryptjs, 10 rounds).
  - User login (`POST /api/v1/auth/login`) with JWT generation (configurable expiry, default 7d).
  - Session recording in database (`Session` model).
  - Protected identity check (`GET /api/v1/auth/me`).
  - Route authentication middleware (`authenticate`) extracting and verifying Bearer JWTs and resolving user existence.
  - Role-based access control (`requireRole`).
  - Internal service authentication (`requireInternalService`) via `X-Internal-Service-Key`.
- **Project & Workspace Management**:
  - Full CRUD operations on projects (`/api/v1/projects`).
  - Explicit ownership and membership authorization (`project.ownerId === userId || member`). Cross-user isolation verified via automated tests.
  - ASTRA Workspace creation and retrieval (`/api/v1/astra/workspaces`).
- **Conversations & Message Threads**:
  - Thread creation and retrieval (`/api/v1/conversations`).
  - Message appending with chronological ordering (`createdAt: 'asc'`).
  - Conversational access verification ensuring users cannot read others' threads.
- **AI Task Orchestration**:
  - Asynchronous AI task creation (`POST /api/v1/ai/tasks`) returning `202 Accepted`.
  - Task state tracking (`pending` -> `running` -> `completed` / `failed`).
  - Task cancellation (`POST /api/v1/ai/tasks/:id/cancel`).
- **ASTRA Coding Workflows**:
  - Coding task creation in `proposed` status (`POST /api/v1/astra/tasks`).
  - Integration with ASTRA Engine for patch proposal planning.
  - Human-in-the-loop task approval (`POST /api/v1/astra/tasks/:id/approve`), transitioning state to `approved` and queuing an `ExecutionJob`.
  - Non-proposed task approval rejection (prevents re-approving completed or failed tasks).
- **Cross-Cutting Concerns**:
  - Input validation using Joi schemas across all mutation routes.
  - Standardized JSON responses and error envelopes: `{ success: false, error: { code, message, requestId } }`.
  - Request correlation ID generation (`req_${uuid}`) passed via headers and logged.
  - Structured logging with automatic redaction of sensitive credentials.
  - Security headers via Helmet, configurable CORS, and rate limiting (100 req / 15 min).
  - Clean Prisma disconnect on `SIGINT` / `SIGTERM` graceful shutdown.

### B. BRAHMA Core (`services/brahma-core`)
- Provider abstraction architecture (`BaseProvider`, `MockProvider`, `OpenAIProvider`, `AnthropicProvider`, `GeminiProvider`).
- Zero-external-dependency MockProvider execution for deterministic offline development and testing.
- Provider configuration validation (returns descriptive error when API key is missing).
- Internal service authentication enforcement (`X-Internal-Service-Key` verification).
- Task execution (`POST /api/v1/tasks/execute`) and cancellation (`POST /api/v1/tasks/{task_id}/cancel`).

### C. ASTRA Engine (`services/astra-engine`)
- Coding task planning & patch proposal generation (`POST /api/v1/tasks/plan`).
- Structured patch proposal schema (`patch_proposal` with diffs and planned files).
- Task execution coordination (`POST /api/v1/tasks/execute-approved`).
- Internal service authentication enforcement (`X-Internal-Service-Key`).

### D. ASTRA Runner (`services/astra-runner`)
- Security boundary service isolating execution attempts from all other services.
- **Disabled-by-default execution on native Windows** (`RUNNER_EXECUTION_MODE=disabled`).
- Rejection of dangerous commands (`sudo`, `rm -rf /`, `mkfs`, format commands).
- Environment scrubbing stripping sensitive variables (`*KEY*`, `*SECRET*`, `*TOKEN*`, `*PASS*`, `*DATABASE*`).
- Process tree termination and timeout controls.
- Security status inspection endpoint (`GET /api/v1/security-status`).

---

## 4. Test Results and Commands

### Automated Test Suite Results
All tests were executed on native Windows using the following command:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-all.ps1
```

**Results: 47 / 47 Passed (100%), 0 Failed, 0 Warnings**

1. **Prisma Schema Parity (`validate-postgres-compatibility.js`)**:
   - `[PASSED]` 11 of 11 models match between SQLite and PostgreSQL schemas (User, Session, Project, ProjectMember, Conversation, Message, AiTask, AstraWorkspace, CodingTask, ExecutionJob, AuditLog).
2. **Application API (`services/api`, Jest)**:
   - `[PASSED]` 7 test suites, 27 tests passed:
     - `health.test.js`: 2 tests passed.
     - `auth.test.js`: 6 tests passed.
     - `projects.test.js`: 6 tests passed.
     - `conversations.test.js`: 4 tests passed.
     - `ai.test.js`: 3 tests passed.
     - `astra.test.js`: 4 tests passed.
     - `errors.test.js`: 2 tests passed.
3. **BRAHMA Core (`services/brahma-core`, pytest)**:
   - `[PASSED]` 7 tests passed:
     - `test_health.py`: Live and ready probes.
     - `test_providers.py`: MockProvider execution & unconfigured external provider error handling.
     - `test_tasks.py`: Authentication rejection, mock execution, and task cancellation.
4. **ASTRA Engine (`services/astra-engine`, pytest)**:
   - `[PASSED]` 5 tests passed:
     - `test_health.py`: Live and ready probes.
     - `test_tasks.py`: Authentication rejection, patch proposal planning, and execution dispatch.
5. **ASTRA Runner (`services/astra-runner`, pytest)**:
   - `[PASSED]` 8 tests passed:
     - `test_health.py`: Live probe, ready probe, and security status endpoint.
     - `test_security.py`: Auth verification, default disabled execution, command blacklist, env scrubbing, and timeout handling.

### Live Services HTTP Smoke Test Results
Executed against background services running on native ports 3000, 8001, 8002, and 8003:
```powershell
node scripts/smoke-test.js
```
**Results: 8 / 8 Checks Passed**
- `[PASS]` `http://localhost:3000/health/live` (status: "ok")
- `[PASS]` `http://localhost:3000/health/ready` (status: "ready", database: "connected")
- `[PASS]` `http://localhost:8001/health/live` (status: "ok")
- `[PASS]` `http://localhost:8001/health/ready` (ready: true, provider: "mock")
- `[PASS]` `http://localhost:8002/health/live` (status: "ok")
- `[PASS]` `http://localhost:8002/health/ready` (status: "ready")
- `[PASS]` `http://localhost:8003/health/live` (status: "ok")
- `[PASS]` `http://localhost:8003/api/v1/security-status` (execution_mode: "disabled", verified: true)

---

## 5. Security Findings and Severities

| ID | Finding | Severity | Status | Description & Remediation |
|---|---|---|---|---|
| **SEC-01** | Windows Subprocess Sandbox Assumption | **CRITICAL** | **MITIGATED** | **Risk:** Executing arbitrary code in a native Windows child process lacks namespace or hardware isolation, giving untrusted code full access to the host.<br>**Remediation:** Execution is strictly disabled by default (`RUNNER_EXECUTION_MODE=disabled`) on native Windows. Arbitrary execution is blocked unless a verified container or microVM isolation sandbox is configured. |
| **SEC-02** | Default Internal Service Key in Development | **MEDIUM** | **ACCEPTED (DEV)** | **Risk:** Fallback `dev_internal_service_key_change_in_production` allows microservice access if reachable.<br>**Remediation:** The Express and FastAPI services must enforce a non-default high-entropy secret when `NODE_ENV=production`. In dev, the internal key is required in headers. |
| **SEC-03** | Stateless JWT Revocation vs Database Session | **LOW** | **DOCUMENTED** | **Risk:** `POST /api/v1/auth/logout` deletes the session from `prisma.session`. However, the `authenticate` middleware verifies JWTs statelessly without a database lookup on every request, meaning an existing token remains valid until expiration.<br>**Remediation:** For production, implement either shorter token TTLs with refresh tokens or query `prisma.session` / Redis for active token state. |
| **SEC-04** | SQLite Single-Writer Lock Contention | **LOW** | **ARCHITECTURAL** | **Risk:** Under heavy concurrent write operations, SQLite can experience lock contention (`SQLITE_BUSY`).<br>**Remediation:** SQLite is strictly used for zero-friction local development. PostgreSQL schemas and migration scripts are prepared and validated for integration and production. |
| **SEC-05** | Credential Scrubbing in Observability | **LOW** | **MITIGATED** | **Risk:** Accidental logging of tokens, passwords, or secrets.<br>**Remediation:** Recursive key masking is implemented in both Node.js (Winston) and Python loggers for keys matching password, token, secret, auth, and key. |

---

## 6. Deprecation Analysis: Starlette HTTPX Deprecation Warning

- **Issue**: During pytest runs in FastAPI services, Starlette `1.8.0` emitted:
  ```
  StarletteDeprecationWarning: Using 'httpx' with 'starlette.testclient' is deprecated; install 'httpx2' instead.
  ```
- **Analysis**: Starlette testclient includes conditional logic attempting `import httpx2 as httpx`. If absent, it falls back to standard `httpx` and issues a deprecation warning. However, `httpx2` is a third-party, non-standard fork and is not adopted by the core FastAPI library. Upgrading or switching to `httpx2` poses dependency stability risks.
- **Resolution**: Configured `filterwarnings = ["ignore::starlette.exceptions.StarletteDeprecationWarning"]` under `[tool.pytest.ini_options]` in `pyproject.toml` across `brahma-core`, `astra-engine`, and `astra-runner`. The test suite now executes with 0 warnings while retaining stable, official `httpx>=0.27.0`.

---

## 7. Known Limitations

1. **Arbitrary Code Execution Disabled Locally**: In accordance with the security baseline, ASTRA Runner cannot run arbitrary shell code on local native Windows. Patch proposals, diff generation, and workflow approvals are fully functional, but command dispatch returns `status: "disabled"`.
2. **Mock AI Provider by Default**: BRAHMA Core defaults to `mock` provider. Real LLM inference requires populating `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` in `.env`.
3. **HTTP Polling vs WebSocket Real-Time Streaming**: Real-time log streaming currently uses HTTP polling on task endpoints (`/api/v1/ai/tasks/:id`, `/api/v1/astra/tasks/:id`). WebSocket / SSE streaming is architectural next work.

---

## 8. Production Blockers

The following items must be addressed before deploying to a public production environment:
1. **Container / MicroVM Sandbox for ASTRA Runner**: Implement an isolated runtime (e.g. gVisor, Firecracker, or isolated container agent) before setting `RUNNER_EXECUTION_MODE=docker` or `isolated`.
2. **Production Database**: Provision a managed PostgreSQL instance and execute `scripts/migrate-postgres.ps1` to apply migrations.
3. **Production Secrets Injection**: Set strong, random strings for `JWT_SECRET` and `INTERNAL_SERVICE_KEY`, and inject API keys via a secret manager.
4. **Stateful Token Invalidation**: Enhance `authenticate` middleware with token revocation checks against `Session` or Redis.

---

## 9. Recommended Next Steps

1. **Architectural Sign-Off**: Review this audit report and confirm readiness to begin frontend work.
2. **Frontend Milestone (`apps/web`)**:
   - Initialize the React + Vite frontend application.
   - Implement authentication flows (Login, Register, Session restore).
   - Build Project Dashboard and Workspace views.
   - Build BRAHMA Chat & Conversation UI with markdown message rendering.
   - Build ASTRA Workspace UI (file tree, patch proposal review, task approve/cancel actions).
3. **Continuous Integration**:
   - Configure a GitHub Actions / CI pipeline executing `scripts/test-all.ps1` on PRs.
