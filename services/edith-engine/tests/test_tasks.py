import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.config import settings

client = TestClient(app)

def test_engine_rejects_unauthenticated():
    res = client.post("/api/v1/tasks", json={
        "task_id": "task-test-1",
        "workspace_id": "ws-1",
        "instruction": "Fix bug"
    })
    assert res.status_code == 403

def test_engine_plan_coding_task():
    res = client.post(
        "/api/v1/tasks",
        headers={"x-internal-service-key": settings.internal_service_key},
        json={
            "task_id": "task-test-plan",
            "workspace_id": "ws-1",
            "instruction": "Implement user authentication in python"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["task_id"] == "task-test-plan"
    assert data["status"] == "proposed"
    assert "patch_proposal" in data
    assert len(data["patch_proposal"]["files"]) > 0

@patch("app.api.tasks.runner_client.execute", new_callable=AsyncMock)
def test_engine_execute_task(mock_execute):
    mock_execute.return_value = {
        "job_id": "job_task-123",
        "status": "succeeded",
        "exit_code": 0,
        "stdout": "Verification test passed",
        "sandboxed": True
    }

    res = client.post(
        "/api/v1/tasks/task-123/execute",
        headers={"x-internal-service-key": settings.internal_service_key}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["task_id"] == "task-123"
    assert data["status"] == "succeeded"
    assert data["exit_code"] == 0
    assert "Verification test passed" in data["output"]
