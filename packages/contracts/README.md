# @friday-edith/contracts

Shared contracts, status enums, error shapes, and OpenAPI schemas for the FRIDAY intelligence platform and EDITH coding workspace.

## Error Format
All services conform to the standard error shape:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'email' must be a valid email",
    "details": [],
    "requestId": "req_1729050000000"
  }
}
```

## Status Lifecycles
- **AI Task Lifecycle**: `pending` -> `running` -> `completed` / `failed` / `cancelled`
- **EDITH Coding Task Lifecycle**: `proposed` -> `approved` -> `running` -> `completed` / `failed` / `cancelled`
- **Runner Job Lifecycle**: `queued` -> `running` -> `succeeded` / `failed` / `timed_out` / `cancelled`
