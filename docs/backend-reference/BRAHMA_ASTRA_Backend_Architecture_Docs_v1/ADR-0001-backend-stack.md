# ADR-0001: Backend stack and database ownership

- **Status:** Accepted
- **Date:** 2026-10-13

## Decision
- Node.js + JavaScript + Express is the application API.
- Python + FastAPI provides Brahma Core and Astra Engine.
- SQLite is the database for initial development.
- PostgreSQL is the target database for integration testing and production.
- Prisma owns the application schema; database-provider migration histories must be managed separately.
- Prisma owns the primary application schema and migrations from the Node.js service.
- Redis supports cache/queues/rate limiting where needed.
- ASTRA execution is isolated from application services.

## Rationale
A consistent database engine across environments reduces migration surprises. Prisma provides typed database access and migration workflow for Node.js. Python remains focused on AI orchestration and coding workflows, accessing application data through authenticated internal APIs initially.

## Consequences
- Prisma schema and migrations live in `services/api/prisma`.
- Python services do not independently migrate Prisma-owned tables.
- Any future direct Python database access requires explicit table ownership and a documented architecture decision.
- Production migrations require review, backup and controlled rollout.
