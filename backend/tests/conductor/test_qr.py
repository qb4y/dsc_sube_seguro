from app.conductor.application.qr import generate_qr_png

PNG_HEADER = b"\x89PNG\r\n\x1a\n"


def test_genera_png():
    png = generate_qr_png("http://localhost:8000/conductor/verify/abc123")
    assert png[:8] == PNG_HEADER
