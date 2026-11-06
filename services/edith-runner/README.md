# ASTRA Runner — Isolated Code Execution Boundary

## Security Boundary & Threat Model

ASTRA Runner is an isolated execution service designed to coordinate code execution submitted via ASTRA Engine. It enforces strict security boundaries:

1. **Process Isolation**: Code is NEVER executed inside the Node.js API, Brahma Core, or Astra Engine processes.
2. **Native Windows Security Policy**: A standard Windows child process, Python subprocess, or restricted working directory is NOT a secure sandbox. Therefore, in native Windows development, arbitrary code execution is **STRICTLY DISABLED BY DEFAULT** (`RUNNER_EXECUTION_MODE=disabled`). Execution requests return a clear, documented `execution unavailable` status.
3. **Verified Sandbox Requirement**: Arbitrary code execution may only be enabled when a verified hardware/container isolation mechanism (e.g. Windows AppContainer, microVM, or isolated hypervisor runtime) is configured and active.
4. **Current Capability**: No verified sandbox adapter is implemented yet. The runner returns an unavailable response for every execution mode, including `restricted_subprocess` and `verified_sandbox`; a configuration value alone cannot enable code execution.
5. **Future Runtime Requirements**: A sandbox adapter must enforce filesystem, network, memory, process-tree, timeout, and output limits before execution can be enabled. The helper subprocess implementation is not a supported security boundary.

## Service Endpoints
- Port: `8003`
- `GET /health/live`: Liveness probe.
- `GET /health/ready`: Readiness probe.
- `GET /api/v1/security-status`: Reports whether a sandbox adapter is verified. This is currently `false` and execution is unavailable.
- `POST /api/v1/execute`: Authenticated execution endpoint (requires `X-Internal-Service-Key`).
