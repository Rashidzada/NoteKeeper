def test_create_note_success(client, auth_headers):
    payload = {
        "title": "Meeting Notes",
        "content": "Discuss project milestones...",
        "tags": ["meeting", "project"],
        "is_favorite": True,
        "color": "#FF5733",
    }
    res = client.post("/api/v1/notes/", headers=auth_headers, json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Meeting Notes"
    assert data["content"] == "Discuss project milestones..."
    assert data["is_favorite"] is True
    assert "meeting" in data["tags"]
    assert "id" in data


def test_create_note_unauthenticated(client):
    res = client.post(
        "/api/v1/notes/",
        json={"title": "Unauthorized Note", "content": "Should fail"},
    )
    assert res.status_code == 401


def test_list_notes_with_pagination_and_sorting(client, auth_headers):
    # Create 5 notes
    for i in range(5):
        client.post(
            "/api/v1/notes/",
            headers=auth_headers,
            json={"title": f"Note {i}", "content": f"Content {i}"},
        )

    res = client.get("/api/v1/notes/?skip=0&limit=3", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 3
    assert data["total"] == 5
    assert data["skip"] == 0
    assert data["limit"] == 3


def test_search_notes(client, auth_headers):
    client.post(
        "/api/v1/notes/",
        headers=auth_headers,
        json={"title": "Secret Recipe", "content": "Flour and sugar"},
    )
    client.post(
        "/api/v1/notes/",
        headers=auth_headers,
        json={"title": "Gym Workout", "content": "Bench press and squats"},
    )

    res = client.get("/api/v1/notes/?search=Recipe", headers=auth_headers)
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) == 1
    assert items[0]["title"] == "Secret Recipe"


def test_filter_notes_by_category_and_tags(client, auth_headers):
    # Create category
    cat_res = client.post(
        "/api/v1/categories/",
        headers=auth_headers,
        json={"name": "Work"},
    )
    cat_id = cat_res.json()["id"]

    # Note 1 with category
    client.post(
        "/api/v1/notes/",
        headers=auth_headers,
        json={"title": "Work Note", "content": "Work content", "category_id": cat_id, "tags": ["work", "urgent"]},
    )
    # Note 2 without category
    client.post(
        "/api/v1/notes/",
        headers=auth_headers,
        json={"title": "Home Note", "content": "Home content", "tags": ["home"]},
    )

    # Filter by category
    res_cat = client.get(f"/api/v1/notes/?category_id={cat_id}", headers=auth_headers)
    assert res_cat.status_code == 200
    assert len(res_cat.json()["items"]) == 1
    assert res_cat.json()["items"][0]["title"] == "Work Note"

    # Filter by tag
    res_tag = client.get("/api/v1/notes/?tag=urgent", headers=auth_headers)
    assert res_tag.status_code == 200
    assert len(res_tag.json()["items"]) == 1
    assert res_tag.json()["items"][0]["title"] == "Work Note"


def test_update_and_delete_note(client, auth_headers):
    note = client.post(
        "/api/v1/notes/",
        headers=auth_headers,
        json={"title": "Original Title", "content": "Original content"},
    ).json()

    # Update note
    patch_res = client.patch(
        f"/api/v1/notes/{note['id']}",
        headers=auth_headers,
        json={"title": "Updated Title", "is_favorite": True},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Updated Title"
    assert patch_res.json()["is_favorite"] is True

    # Delete note
    del_res = client.delete(f"/api/v1/notes/{note['id']}", headers=auth_headers)
    assert del_res.status_code == 204

    # Verify 404
    get_res = client.get(f"/api/v1/notes/{note['id']}", headers=auth_headers)
    assert get_res.status_code == 404


def test_user_cannot_access_other_users_note(client, auth_headers):
    # Note created by user 1
    note = client.post(
        "/api/v1/notes/",
        headers=auth_headers,
        json={"title": "User 1 Note", "content": "Private"},
    ).json()

    # Register user 2
    reg2 = client.post(
        "/api/v1/auth/register",
        json={"email": "user2@example.com", "username": "user2", "password": "Password123!"},
    )
    headers2 = {"Authorization": f"Bearer {reg2.json()['access_token']}"}

    # User 2 tries to get note of User 1
    get_res = client.get(f"/api/v1/notes/{note['id']}", headers=headers2)
    assert get_res.status_code == 404

    # User 2 tries to patch note of User 1
    patch_res = client.patch(f"/api/v1/notes/{note['id']}", headers=headers2, json={"title": "Hacked"})
    assert patch_res.status_code == 404


def test_batch_delete_notes(client, auth_headers):
    n1 = client.post("/api/v1/notes/", headers=auth_headers, json={"title": "N1", "content": "C1"}).json()
    n2 = client.post("/api/v1/notes/", headers=auth_headers, json={"title": "N2", "content": "C2"}).json()
    n3 = client.post("/api/v1/notes/", headers=auth_headers, json={"title": "N3", "content": "C3"}).json()

    batch_res = client.post(
        "/api/v1/notes/batch",
        headers=auth_headers,
        json={"note_ids": [n1["id"], n2["id"]]},
    )
    assert batch_res.status_code == 200
    assert batch_res.json()["deleted_count"] == 2

    # Verify only n3 remains
    remaining = client.get("/api/v1/notes/", headers=auth_headers).json()["items"]
    remaining_ids = [n["id"] for n in remaining]
    assert n3["id"] in remaining_ids
    assert n1["id"] not in remaining_ids
    assert n2["id"] not in remaining_ids
