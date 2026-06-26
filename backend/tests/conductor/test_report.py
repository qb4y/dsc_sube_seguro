from app.conductor.application.report import create_report, get_report


def test_create_and_retrieve():
    report = create_report(placa="ABC123", dni="12345678")
    assert report.report_id
    assert report.placa == "ABC123"
    assert len(report.signature) == 64  # SHA-256 hex


def test_not_found():
    assert get_report("nonexistent") is None


def test_ids_unique():
    r1 = create_report("ABC123", "11111111")
    r2 = create_report("ABC123", "11111111")
    assert r1.report_id != r2.report_id
