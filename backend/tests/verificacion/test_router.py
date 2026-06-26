from unittest.mock import AsyncMock, patch

from app.shared.models import Check, Color, Veredicto, now_utc


def _veredicto(placa: str) -> Veredicto:
    return Veredicto(
        color=Color.verde,
        resumen="Todo en orden.",
        placa=placa,
        checks=[
            Check(
                clave="soat", etiqueta="SOAT", color=Color.verde,
                detalle="SOAT vigente.", fuente="json.pe", consultado_en=now_utc(),
            )
        ],
    )


def test_pasajero_ok(client):
    with patch("app.verificacion.router.VerificacionAggregator") as MockAgg:
        MockAgg.return_value.verificar_pasajero = AsyncMock(return_value=_veredicto("ABC123"))
        r = client.post("/verificar/pasajero", json={"placa": "ABC123"})
    assert r.status_code == 200
    assert r.json()["color"] == "verde"
    assert r.json()["placa"] == "ABC123"


def test_pasajero_placa_vacia(client):
    r = client.post("/verificar/pasajero", json={"placa": ""})
    assert r.status_code == 422
