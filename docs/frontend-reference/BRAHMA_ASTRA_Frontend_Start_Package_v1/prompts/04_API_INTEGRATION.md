# Prompt 04 — Backend API Integration

Audit the frontend against the actual Node.js/Express and Python FastAPI service implementations and `docs/backend-reference/API_CONTRACTS.md`. Integrate only endpoints that exist and whose request/response shapes are verified. Use a centralized API client, environment-configured base URL, consistent error handling, cancellation/timeouts where appropriate, and loading/retry states. Keep secrets server-side; never place provider API keys in Vite-exposed variables.

Clearly separate real integration from mock/demo behavior. Do not silently substitute mock success when a real API fails. Do not invent endpoint paths, response fields, account data, model availability, activity, test outcomes, or deployment status. Preserve SQLite-first local development and native Windows commands. Do not change backend schema/contracts just to fit the UI without identifying the issue and proposing a minimal, explicit change.

Keep ASTRA arbitrary code execution disabled until a verified sandbox is in place. Run integration checks and all relevant tests, and document exact commands/results, endpoints integrated, mock-only areas, and blockers in `IMPLEMENTATION_STATUS.md`.
