import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_tasks_reject_unauthenticated():
    response = client.post(
        "/api/v1/tasks",
        json={"task_id": "test-123", "prompt": "Synthesize data"}
    )
    assert response.status_code == 403

def test_tasks_execute_mock_successfully():
    response = client.post(
        "/api/v1/tasks",
        headers={"x-internal-service-key": settings.internal_service_key},
        json={
            "task_id": "test-task-1",
            "prompt": "Evaluate system telemetry",
            "task_type": "research"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == "test-task-1"
    assert data["status"] == "completed"
    assert data["provider"] == "mock"
    assert "result" in data
    assert data["result"]["task_type"] == "research"

def test_tasks_cancel():
    response = client.post(
        "/api/v1/tasks/test-task-cancelled/cancel",
        headers={"x-internal-service-key": settings.internal_service_key}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
