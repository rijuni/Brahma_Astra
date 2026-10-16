# API Contracts — Initial Plan

## Principles
- Public application API prefix: `/api/v1`.
- OpenAPI is the source of truth for request/response shapes.
- Validate at the boundary; reject unexpected or invalid input.
- Return a consistent error shape and request ID.
- Use cursor pagination for large collections.
- Protect all user-owned resources with server-side authorization.
- Internal FastAPI services are private by default and require service authentication.

## Initial public route groups (planned, not implemented)
### Health
- `GET /health/live` — process is alive.
- `GET /health/ready` — dependencies required for readiness are available; do not expose secrets.

### Authentication and account
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh` (if refresh-token sessions are selected)
- `GET /api/v1/me`
- Password reset/verification routes to be specified with email provider choice.

### Projects
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `PATCH /api/v1/projects/{projectId}`
- `DELETE /api/v1/projects/{projectId}`

### Conversations
- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `GET /api/v1/conversations/{conversationId}`
- `POST /api/v1/conversations/{conversationId}/messages`
- Streaming response contract to be selected (SSE is a reasonable default).

### AI orchestration
- `POST /api/v1/ai/tasks`
- `GET /api/v1/ai/tasks/{taskId}`
- `POST /api/v1/ai/tasks/{taskId}/cancel`

### ASTRA coding tasks
- `POST /api/v1/astra/workspaces`
- `GET /api/v1/astra/workspaces/{workspaceId}`
- `POST /api/v1/astra/tasks`
- `GET /api/v1/astra/tasks/{taskId}`
- `POST /api/v1/astra/tasks/{taskId}/approve`
- `POST /api/v1/astra/tasks/{taskId}/cancel`
- Execution and deployment endpoints require a separate threat review and explicit permission design before implementation.

### User controls
- `GET /api/v1/memory`
- `PATCH /api/v1/memory/settings`
- `DELETE /api/v1/memory/{memoryId}`
- `GET /api/v1/notifications`
- `GET/PATCH /api/v1/settings`

These route names are proposals for planning. Final schemas, status codes, auth flow and streaming format must be written into OpenAPI before the corresponding endpoints are implemented.

## Internal service calls
- Express → Brahma Core: internal task request with a scoped service identity.
- Express → Astra Engine: scoped coding task request.
- Astra Engine → Runner: job request containing only the minimum workspace mount and limits needed.
- Use request IDs and deadlines; do not forward browser credentials blindly to internal services.
