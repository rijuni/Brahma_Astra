# BRAHMA + ASTRA Backend Documentation v1

Start here. This documentation defines the backend repository structure and initial implementation sequence.

## Locked stack
- Application API: Node.js + JavaScript + Express
- ORM/schema owner: Prisma
- Database: SQLite for initial development; PostgreSQL for integration testing and production
- AI services: Python + FastAPI
- Cache/queues/rate limiting: Redis
- Frontend is separate: React + JavaScript + Vite; no TypeScript
- ASTRA code execution must run in a restricted isolated environment, never directly on the API host.

## Recommended first implementation order
1. Create the monorepo structure.
2. Configure SQLite for initial development. Add PostgreSQL to the integration-test environment, with Redis when required.
3. Set up the Node.js API and Prisma schema/migrations.
4. Define API contracts and authentication/authorization boundaries.
5. Set up Python FastAPI service contracts.
6. Add health checks, logging, tests, CI and security baselines.
7. Only then expand application features.

See `BACKEND_ARCHITECTURE.md`, `REPOSITORY_STRUCTURE.md`, `DATABASE_AND_PRISMA.md`, `API_CONTRACTS.md`, `SECURITY_BASELINE.md`, and `IMPLEMENTATION_ROADMAP.md`.

Do not treat this document package as implemented code. It is the agreed blueprint to implement in the repository.


## Database migration note

SQLite is the initial-development database only. PostgreSQL is the integration/production target. Prisma migrations are provider-specific, so validate the PostgreSQL schema and migration path in a PostgreSQL test environment before deployment; do not assume SQLite migration files can be reused directly.
