import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.security.sanitizer import sanitize_environment
from app.security.policy import validate_command_safety

client = TestClient(app)

def test_runner_rejects_missing_internal_key():
    res = client.post("/api/v1/execute", json={"job_id": "job-1", "command": "echo test"})
    assert res.status_code == 403

def test_runner_execution_disabled_by_default():
    """Verify that by default in native Windows development, arbitrary execution is safely disabled."""
    assert settings.execution_mode == "disabled"
    res = client.post(
        "/api/v1/execute",
        headers={"x-internal-service-key": settings.internal_service_key},
        json={
            "job_id": "job-test-disabled",
            "code": "print('hello')",
            "language": "python"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "disabled"
    assert data["exit_code"] == -1
    assert "Execution unavailable" in data["stderr"]
    assert data["sandboxed"] is False

def test_runner_rejects_dangerous_command():
    # Temporarily enable execution mode to test command policy filter
    orig_mode = settings.execution_mode
    try:
        settings.execution_mode = "restricted_subprocess"
        res = client.post(
            "/api/v1/execute",
            headers={"x-internal-service-key": settings.internal_service_key},
            json={"job_id": "job-bad", "command": "sudo rm -rf /"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "blocked"
        assert "Policy violation" in data["stderr"]
    finally:
        settings.execution_mode = orig_mode

def test_runner_sanitizes_environment():
    import os
    os.environ["SECRET_DATABASE_URL"] = "postgres://root:secret@localhost:5432"
    os.environ["OPENAI_API_KEY"] = "sk-supersecret123"

    sanitized = sanitize_environment({"CUSTOM_VAR": "safe_value"})
    assert "SECRET_DATABASE_URL" not in sanitized
    assert "OPENAI_API_KEY" not in sanitized
    assert sanitized.get("CUSTOM_VAR") == "safe_value"

def test_runner_timeout_and_execution_when_mode_enabled():
    orig_mode = settings.execution_mode
    try:
        settings.execution_mode = "restricted_subprocess"
        # Test safe execution
        res = client.post(
            "/api/v1/execute",
            headers={"x-internal-service-key": settings.internal_service_key},
            json={
                "job_id": "job-py-safe",
                "code": "print('TEST_OUTPUT_EXECUTION')",
                "language": "python"
            }
        )
        assert res.status_code == 200
        assert res.json()["status"] == "succeeded"
        assert "TEST_OUTPUT_EXECUTION" in res.json()["stdout"]

        # Test timeout enforcement
        res_timeout = client.post(
            "/api/v1/execute",
            headers={"x-internal-service-key": settings.internal_service_key},
            json={
                "job_id": "job-timeout",
                "code": "import time\ntime.sleep(5)",
                "language": "python",
                "timeout_seconds": 1
            }
        )
        assert res_timeout.status_code == 200
        assert res_timeout.json()["status"] == "timed_out"
    finally:
        settings.execution_mode = orig_mode
