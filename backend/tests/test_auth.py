import pytest


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"


def test_register_user_success(client):
    payload = {
        "email": "alice@example.com",
        "username": "alice",
        "password": "Password123!",
        "full_name": "Alice Wonderland",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["username"] == "alice"


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "username": "user1",
        "password": "Password123!",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201

    payload2 = {
        "email": "duplicate@example.com",
        "username": "user2",
        "password": "Password123!",
    }
    res2 = client.post("/api/v1/auth/register", json=payload2)
    assert res2.status_code == 409


def test_login_success(client):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "Password123!"},
    )

    # Login with username
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "loginuser", "password": "Password123!"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()

    # Login with email
    res_email = client.post(
        "/api/v1/auth/login",
        json={"username": "login@example.com", "password": "Password123!"},
    )
    assert res_email.status_code == 200


def test_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "wrongpwd@example.com", "username": "wrongpwd", "password": "Password123!"},
    )

    res = client.post(
        "/api/v1/auth/login",
        json={"username": "wrongpwd", "password": "BadPassword!"},
    )
    assert res.status_code == 401


def test_refresh_token(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": "refresh@example.com", "username": "refreshuser", "password": "Password123!"},
    )
    refresh_token = reg.json()["refresh_token"]

    res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_get_current_user_me(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["username"] == "tester123"
