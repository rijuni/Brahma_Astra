# Backend Implementation Roadmap

## Milestone 0 — Repository baseline
- [ ] Create monorepo and branch conventions.
- [ ] Add documentation and implementation status file.
- [ ] Add `.gitignore`, `.editorconfig`, `.env.example`.
- [ ] Configure SQLite for initial local development.
- [ ] Add PostgreSQL to the integration-test environment; add Redis when needed.
- [ ] Add CI baseline.

## Milestone 1 — Node API foundation
- [ ] Create Express app and server startup separation.
- [ ] Add configuration validation, health endpoints, request IDs and structured logging.
- [ ] Add validation/error middleware, security headers, CORS and rate limits.
- [ ] Add Prisma/SQLite schema and migration workflow for initial development.
- [ ] Create and test a separate Prisma/PostgreSQL migration workflow for integration testing and production.
- [ ] Add tests for health, validation, errors and DB readiness.

## Milestone 2 — Initial data model
- [ ] Review identity/session approach.
- [ ] Implement minimal User and Session models plus audit basics.
- [ ] Add first migration and seed only non-sensitive development data.
- [ ] Test ownership, uniqueness, foreign keys and transactions.

## Milestone 3 — Authentication and authorization
- [ ] Registration/login/logout/session handling.
- [ ] Password reset/verification provider decision.
- [ ] Resource ownership policy and authorization tests.
- [ ] Rate limits and brute-force protections.

## Milestone 4 — Internal AI service contracts
- [ ] Add Brahma Core FastAPI service with health and typed schemas.
- [ ] Add Astra Engine FastAPI service with health and typed schemas.
- [ ] Add authenticated Express clients and timeouts.
- [ ] Mock providers for tests; keep real credentials server-side.

## Milestone 5 — Domain APIs
- [ ] Projects and memberships.
- [ ] Conversations/messages and streaming contract.
- [ ] Documents and private object-storage metadata.
- [ ] Memory controls, export and deletion.
- [ ] AI task lifecycle and cancellation.
- [ ] ASTRA workspaces, coding tasks, patch proposals and approvals.

## Milestone 6 — ASTRA safe runner
- [ ] Define runner API and threat model.
- [ ] Implement disposable isolated execution.
- [ ] Apply resource/network/filesystem restrictions.
- [ ] Add audit events, cancellation, cleanup and adversarial tests.
- [ ] Do not enable deployment/push actions until separate approval controls exist.

## Milestone 7 — Testing and operations
- [ ] Unit, integration, contract and security tests.
- [ ] PostgreSQL test database in CI and a passing integration-test suite.
- [ ] Backup/restore procedure and staging rehearsal.
- [ ] Metrics, logs, alerts and redaction.
- [ ] Document local setup and deployment configuration.
- [ ] Update status truthfully and obtain release approval.

## Definition of done
A milestone is complete only when its code exists, tests have actually run, results are recorded, configuration is documented, and security boundaries are enforced. A written plan alone is not implementation.
