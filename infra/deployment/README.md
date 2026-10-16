# Deployment & Production Architecture Guidelines

## Architecture Overview
- **Local Development**: Fully native on Windows (Node.js, Python virtual environments, Prisma, and SQLite). No container runtime or Docker daemon required.
- **Application API (`services/api`)**: Runs Node.js Express under a reverse proxy (e.g. IIS, Nginx, Caddy, Cloudflare) with TLS termination.
- **BRAHMA Core (`services/brahma-core`)**: Internal Python FastAPI service, accessible only via private loopback or internal virtual network from `services/api`.
- **ASTRA Engine (`services/astra-engine`)**: Internal Python FastAPI service, accessible only via private loopback or internal network.
- **ASTRA Runner (`services/astra-runner`)**: Dedicated execution service. In local Windows development, arbitrary code execution is disabled by default unless a verified OS-level sandbox (e.g., Windows AppContainer or dedicated microVM) is active. In production, code runs in a hardened, network-isolated microVM or dedicated worker.
- **Database**: Managed PostgreSQL instance (AWS RDS, GCP Cloud SQL, Azure Database, or dedicated Windows/Linux PostgreSQL service) for integration testing and production. Initial local development uses SQLite (`dev.db`).
- **Cache/Queues**: Redis service (optional for local development, recommended for high-throughput production).

## Security Baseline
1. Never expose internal ports 8001, 8002, 8003 to the public internet.
2. Ensure `INTERNAL_SERVICE_KEY` is a minimum 64-character random string rotated across environments.
3. Database migrations for production must be tested and reviewed using the PostgreSQL Prisma workflow (`scripts/migrate-postgres.ps1`) before deployment.
