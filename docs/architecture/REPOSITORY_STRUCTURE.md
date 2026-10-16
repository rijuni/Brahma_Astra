# Repository and Folder/File Structure

Use a monorepo so the frontend and backend contracts stay versioned together. The frontend remains in scope for the full product, but this first milestone starts with backend foundations.

```text
brahma-astra/
├── README.md
├── IMPLEMENTATION_STATUS.md
├── .gitignore
├── .editorconfig
├── .env.example
├── docker-compose.yml
├── package.json                    # optional root scripts/workspaces
├── docs/
│   ├── architecture/
│   │   ├── BACKEND_ARCHITECTURE.md
│   │   ├── REPOSITORY_STRUCTURE.md
│   │   ├── DATABASE_AND_PRISMA.md
│   │   ├── API_CONTRACTS.md
│   │   ├── SECURITY_BASELINE.md
│   │   └── IMPLEMENTATION_ROADMAP.md
│   ├── decisions/
│   │   └── ADR-0001-backend-stack.md
│   └── openapi/
│       └── application-api.yaml
├── apps/
│   └── web/                         # React + JavaScript + Vite (later milestone)
├── services/
│   ├── api/                         # Node.js + Express; owns Prisma schema
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.js
│   │   └── src/
│   │       ├── app.js
│   │       ├── server.js
│   │       ├── config/
│   │       ├── routes/
│   │       │   └── v1/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── middleware/
│   │       ├── validators/
│   │       ├── schemas/
│   │       ├── clients/              # internal FastAPI clients
│   │       ├── jobs/
│   │       ├── observability/
│   │       └── utils/
│   │   └── tests/
│   ├── brahma-core/                 # Python + FastAPI AI orchestration
│   │   ├── pyproject.toml
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/
│   │   │   ├── core/
│   │   │   ├── orchestration/
│   │   │   ├── providers/
│   │   │   ├── tools/
│   │   │   ├── schemas/
│   │   │   ├── clients/
│   │   │   └── observability/
│   │   └── tests/
│   ├── astra-engine/                # Python + FastAPI coding workflows
│   │   ├── pyproject.toml
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/
│   │   │   ├── workflows/
│   │   │   ├── repository/
│   │   │   ├── patching/
│   │   │   ├── testing/
│   │   │   ├── runner_client/
│   │   │   ├── permissions/
│   │   │   ├── schemas/
│   │   │   └── observability/
│   │   └── tests/
│   └── astra-runner/                # isolated code execution boundary
│       ├── README.md
│       ├── policies/
│       └── tests/
├── packages/
│   └── contracts/                   # OpenAPI and JSON schemas; no secrets
├── infra/
│   ├── docker/
│   ├── postgres/
│   ├── redis/
│   └── deployment/
└── scripts/
    ├── dev-check.sh
    └── wait-for-services.sh
```

## Folder ownership
- `services/api/prisma/`: the only Prisma schema and migration owner initially.
- `services/brahma-core/`: AI orchestration, not user-facing auth/database ownership.
- `services/astra-engine/`: coding workflows and safe runner coordination.
- `services/astra-runner/`: execution boundary, isolated from API credentials and host files.
- `packages/contracts/`: shared public/internal request-response definitions.
- `docs/`: architecture, API, threat model and decisions.
- `apps/web/`: frontend work begins after backend contracts/foundation are established.

## Rules
- JavaScript files use `.js`/`.jsx`; do not add `.ts`/`.tsx`.
- Python files use `.py`; use `pyproject.toml` for Python dependencies.
- Keep `app.js` (Express configuration) separate from `server.js` (listen/startup) to improve testability.
- Keep controllers thin; business logic goes in services; Prisma calls go through repositories/data-access modules where that adds clarity.
- Avoid creating empty folders just to match the tree; add folders when their first module is implemented.
- Never commit `.env`, credentials, tokens, database dumps or user data.
