# Backend Architecture — BRAHMA + ASTRA

**Version:** 1.0  
**Status:** Initial architecture baseline  
**Product names:** BRAHMA and ASTRA (no “AI” suffix)  
**Design constraint:** Approved frontend designs remain locked; backend implementation must not trigger visual redesign.

## 1. Purpose and boundaries

BRAHMA is the main intelligence platform. ASTRA is a separate coding/development workspace that can be opened from BRAHMA but maintains its own workspace, task, repository, execution and audit concepts.

The backend is divided into:
1. **Application API — Node.js + Express:** identity/session endpoints, users, projects, conversations, application resources, permissions, file metadata, orchestration entry points, audit events.
2. **AI services — Python + FastAPI:** Brahma Core orchestration and Astra Engine coding workflows, provider adapters, retrieval/tool orchestration and AI-specific tasks.
3. **Database — staged:** SQLite for initial development, then PostgreSQL for integration testing and production. Prisma owns the application schema and database-specific migrations.
4. **Redis:** queues, short-lived coordination, cache and rate limits where justified. Redis is not the source of truth for persistent records.
5. **Private object storage:** uploaded files, generated artifacts and other binary objects; PostgreSQL stores metadata and ownership, not large binary payloads.
6. **ASTRA isolated runner:** separate, disposable execution environment for user/project code. It must not run arbitrary generated code in the Express or FastAPI process.

## 2. Service responsibilities

### Node.js + Express application API
- Validate request payloads and responses.
- Authenticate users and authorize every resource operation.
- Own the main application database schema through Prisma.
- Expose versioned `/api/v1` routes.
- Call internal Python services using authenticated service-to-service requests.
- Enforce upload limits, rate limits, CORS, secure headers and secret redaction.
- Provide request IDs, structured errors and audit events.
- Never return secrets or internal stack traces to clients.

### Python + FastAPI services
- `brahma-core`: model/provider orchestration, chat/research task workflows and tool selection.
- `astra-engine`: coding task planning, repository inspection, patch proposals, test orchestration and result summarization.
- Define explicit Pydantic request/response models.
- Keep provider credentials server-side.
- Call the ASTRA runner through a narrow, authenticated runner interface.
- Do not independently alter Prisma-owned application tables in the initial version.

### SQLite first, PostgreSQL as the target
- **Initial development:** use SQLite through Prisma for a low-friction local setup.
- **Integration testing and production:** use PostgreSQL through Prisma.
- Do not assume SQLite and PostgreSQL behave identically. Keep schema features portable where practical and validate the application against PostgreSQL before production.
- Prisma migration histories are database-provider-specific. Plan and test a PostgreSQL migration path separately; do not simply copy SQLite migration files into a PostgreSQL migration history.
- Prisma schema and migrations are owned by the Node.js application service.
- Python initially accesses application records through internal APIs. Add direct SQLAlchemy access only if a clear service boundary and table ownership are established.
- Never use `prisma db push` as the production migration process; use reviewed migrations.

### Redis
- Use for rate limits, queues, temporary locks and cache where needed.
- Set TTLs and define failure behavior.
- Do not store durable conversations, project data or audit records only in Redis.

## 3. Request flow

1. Client sends a request to the Express API.
2. Express validates input, authenticates the caller and checks resource permissions.
3. Express reads/writes application data through Prisma and the configured database (SQLite during initial development; PostgreSQL for integration testing and production).
4. For AI tasks, Express calls the relevant FastAPI service using an internal service identity.
5. The Python service calls a provider adapter or permitted tool.
6. For ASTRA execution, the Python service requests an isolated runner job; the runner enforces resource, filesystem and network limits.
7. Results return through Python to Express and then to the client.
8. Meaningful state transitions and risky actions are audited without logging secrets or unnecessary private content.

## 4. API conventions
- Prefix public application routes with `/api/v1`.
- Internal service routes must be network-restricted and authenticated; do not expose them as public routes by default.
- Use JSON, UTC ISO-8601 timestamps, stable IDs and cursor pagination for lists.
- Use consistent error shape: `code`, `message`, optional `details`, `requestId`.
- Validate all inputs at the boundary.
- Make long-running jobs asynchronous with job IDs and status endpoints or streaming where appropriate.
- Support cancellation where the operation can safely stop.
- Use idempotency keys for actions where duplicate execution would cause harm.

## 5. Environment model
- Initial local development: Node API, Python services and SQLite; add Redis only when needed.
- Integration-test environment: PostgreSQL (and Redis for features that depend on it).
- Test: isolated test database and mocked or test model providers; runner tests in isolated environments.
- Staging: production-like topology and configuration.
- Production: private network for internal services, TLS at public boundaries, secret manager/environment injection, backups, monitoring and recovery plan.

## 6. Initial non-goals
- No Electron-specific backend requirement at this stage.
- No unrestricted OS control, silent screen capture or always-listening microphone.
- No direct arbitrary code execution in application containers.
- No premature microservice split beyond the agreed Node API, Python AI services and isolated runner boundary.
