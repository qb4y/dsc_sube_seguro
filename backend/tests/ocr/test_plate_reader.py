from app.ocr.application.plate_reader import extract_plates


def test_detecta_placa_valida():
    assert "ABC123" in extract_plates(["ABC123"])


def test_normaliza_minusculas_y_guion():
    assert "ABC123" in extract_plates(["abc-123"])


def test_ignora_texto_invalido():
    assert extract_plates(["hola", "mundo"]) == []


def test_deduplica():
    result = extract_plates(["ABC123", "ABC123"])
    assert result.count("ABC123") == 1


def test_lista_vacia():
    assert extract_plates([]) == []
