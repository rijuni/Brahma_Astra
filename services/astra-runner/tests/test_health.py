import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_runner_health_live():
    res = client.get("/health/live")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["service"] == "astra-runner"

def test_runner_health_ready():
    res = client.get("/health/ready")
    assert res.status_code == 200
    assert res.json()["status"] == "ready"

def test_runner_security_status():
    res = client.get("/api/v1/security-status")
    assert res.status_code == 200
    data = res.json()
    assert data["verified"] is True
    assert data["host_env_sanitized"] is True
    assert data["ephemeral_cleanup"] is True
