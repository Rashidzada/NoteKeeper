def test_create_and_list_category(client, auth_headers):
    # Create category
    res = client.post(
        "/api/v1/categories/",
        headers=auth_headers,
        json={"name": "Work", "color": "#FF0000", "icon": "briefcase"},
    )
    assert res.status_code == 201
    cat_id = res.json()["id"]
    assert res.json()["name"] == "Work"

    # List categories
    list_res = client.get("/api/v1/categories/", headers=auth_headers)
    assert list_res.status_code == 200
    names = [c["name"] for c in list_res.json()]
    assert "Work" in names


def test_duplicate_category_for_same_user(client, auth_headers):
    client.post(
        "/api/v1/categories/",
        headers=auth_headers,
        json={"name": "Personal"},
    )
    res = client.post(
        "/api/v1/categories/",
        headers=auth_headers,
        json={"name": "Personal"},
    )
    assert res.status_code == 409


def test_update_category(client, auth_headers):
    cat = client.post(
        "/api/v1/categories/",
        headers=auth_headers,
        json={"name": "OldName", "color": "#111111"},
    ).json()

    res = client.patch(
        f"/api/v1/categories/{cat['id']}",
        headers=auth_headers,
        json={"name": "NewName", "color": "#222222"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "NewName"
    assert res.json()["color"] == "#222222"


def test_delete_category(client, auth_headers):
    cat = client.post(
        "/api/v1/categories/",
        headers=auth_headers,
        json={"name": "ToDelete"},
    ).json()

    res = client.delete(f"/api/v1/categories/{cat['id']}", headers=auth_headers)
    assert res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/v1/categories/{cat['id']}", headers=auth_headers)
    assert get_res.status_code == 404
