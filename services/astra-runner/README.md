# ASTRA Runner — Isolated Code Execution Boundary

## Security Boundary & Threat Model

ASTRA Runner is an isolated execution service designed to coordinate code execution submitted via ASTRA Engine. It enforces strict security boundaries:

1. **Process Isolation**: Code is NEVER executed inside the Node.js API, Brahma Core, or Astra Engine processes.
2. **Native Windows Security Policy**: A standard Windows child process, Python subprocess, or restricted working directory is NOT a secure sandbox. Therefore, in native Windows development, arbitrary code execution is **STRICTLY DISABLED BY DEFAULT** (`RUNNER_EXECUTION_MODE=disabled`). Execution requests return a clear, documented `execution unavailable` status.
3. **Verified Sandbox Requirement**: Arbitrary code execution may only be enabled when a verified hardware/container isolation mechanism (e.g. Windows AppContainer, microVM, or isolated hypervisor runtime) is configured and active.
4. **Ephemeral Filesystems**: When execution is active under an isolated runtime, each execution creates an isolated temporary directory that is automatically and reliably purged upon completion (`finally` block).
5. **Environment Scrubbing**: Host environment variables (database credentials, API keys, tokens) are completely stripped. Only allowlisted environment variables (e.g. `PATH`, `LANG`) are passed.
6. **Execution Timeouts**: Subprocesses are executed with strict timeouts (default 10s, max 15s) and killed via process tree termination on timeout.
7. **Output Capping**: stdout/stderr streams are capped at 32 KB to prevent memory exhaustion and DoS attacks.
8. **Command Blacklisting**: Hazardous system administration commands (e.g. `sudo`, `format`, `shutdown`, file system destruction) are rejected.

## Service Endpoints
- Port: `8003`
- `GET /health/live`: Liveness probe.
- `GET /health/ready`: Readiness probe.
- `GET /api/v1/security-status`: Reports verified sandboxing mode (`disabled` on native Windows) and active security limits.
- `POST /api/v1/execute`: Authenticated execution endpoint (requires `X-Internal-Service-Key`).
