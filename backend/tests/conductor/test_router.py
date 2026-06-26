def test_crea_reporte(client):
    r = client.post("/conductor/qr", json={"placa": "ABC123", "dni": "12345678"})
    assert r.status_code == 200
    data = r.json()
    assert "report_id" in data
    assert data["qr_url"].startswith("/conductor/verify/")


def test_verify_not_found(client):
    r = client.get("/conductor/verify/doesnotexist")
    assert r.status_code == 404


def test_qr_png_not_found(client):
    r = client.get("/conductor/qr.png?report_id=doesnotexist")
    assert r.status_code == 404
