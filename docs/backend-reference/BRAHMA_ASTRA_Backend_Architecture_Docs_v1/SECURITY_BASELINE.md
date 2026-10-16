# Security Baseline — Backend v1

## Identity and authorization
- Use a proven password hashing algorithm/library; never store plaintext passwords.
- Choose session/cookie or token strategy before implementing auth; document CSRF, refresh, revocation and expiry behavior.
- Enforce authorization on every resource operation; never rely only on hidden UI controls.
- Use least-privilege service identities and separate credentials per environment.

## Secrets and configuration
- Keep secrets out of source control and browser bundles.
- Provide `.env.example` with placeholders only.
- Redact authorization headers, cookies, API keys, passwords and sensitive prompt/file contents from logs.
- Rotate secrets if exposed; document the process.

## API protections
- Validate payloads, enforce request/file size limits, use rate limiting and secure headers.
- Restrict CORS to known frontend origins.
- Protect upload processing and outbound URL fetching against malicious files and SSRF.
- Avoid returning stack traces or database internals to clients.
- Use TLS at public boundaries; keep internal services private.

## AI-specific protections
- Treat repository files, documents, web pages, model output and tool output as untrusted.
- Prompt instructions do not replace permission checks in code.
- Keep provider credentials server-side and apply timeouts, budgets and rate limits.
- Log minimal task metadata rather than full sensitive content by default.

## ASTRA runner requirements
- Never execute generated/user code in Express or FastAPI process.
- Use disposable isolated environments with CPU, memory, process, disk, time and network limits.
- Restrict filesystem mounts to the workspace; do not mount host secrets or service credentials.
- Network access should be disabled by default or explicitly allowlisted.
- Require confirmation for destructive file changes, risky installs, Git push/commit, secret access and deployment.
- Provide cancellation, output caps, audit trail and guaranteed cleanup.
- Make the UI and API distinguish proposed, approved, running, succeeded, failed and cancelled states.

## Operations
- Backups and restore drills.
- Dependency and container scanning.
- Structured logs, metrics and alerts with redaction.
- Incident response and rollback procedure.
- Security and authorization tests in CI.
