"""
Integration-style tests for json.pe adapters using fixture responses.
Uses respx to intercept HTTP calls — no real network needed.
"""
import json
from pathlib import Path

import pytest
import respx
from httpx import Response

from app.verificacion.infrastructure.jsonpe import (
    JsonPeLicenciaAdapter,
    JsonPeSoatAdapter,
    JsonPeVehiculoAdapter,
)

FIXTURES = Path(__file__).parent.parent / "fixtures"


def _fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    monkeypatch.setenv("JSONPE_TOKEN", "test-token")
    monkeypatch.setenv("APP_SECRET", "test-secret")


# ---------------------------------------------------------------------------
# SOAT
# ---------------------------------------------------------------------------

@respx.mock
@pytest.mark.asyncio
async def test_soat_vigente():
    respx.post("https://api.json.pe/api/soat").mock(
        return_value=Response(200, json=_fixture("jsonpe_soat.json"))
    )
    result = await JsonPeSoatAdapter().consultar("ABC123")
    assert result is not None
    assert result.vigente is True
    assert result.aseguradora == "Rimac Seguros"
    assert result.fecha_vencimiento is not None


@respx.mock
@pytest.mark.asyncio
async def test_soat_not_found():
    respx.post("https://api.json.pe/api/soat").mock(
        return_value=Response(200, json={"success": False})
    )
    result = await JsonPeSoatAdapter().consultar("XXX000")
    assert result is None


@respx.mock
@pytest.mark.asyncio
async def test_soat_vencido():
    respx.post("https://api.json.pe/api/soat").mock(
        return_value=Response(200, json={
            "success": True,
            "data": {"estado": "VENCIDO", "fecha_fin": "01/01/2023", "nombre_compania": "La Positiva"}
        })
    )
    result = await JsonPeSoatAdapter().consultar("ABC123")
    assert result is not None
    assert result.vigente is False


# ---------------------------------------------------------------------------
# Vehiculo
# ---------------------------------------------------------------------------

@respx.mock
@pytest.mark.asyncio
async def test_vehiculo_ok():
    respx.post("https://api.json.pe/api/placa").mock(
        return_value=Response(200, json=_fixture("jsonpe_vehiculo.json"))
    )
    result = await JsonPeVehiculoAdapter().consultar("ABC123")
    assert result is not None
    assert result.marca == "Toyota"
    assert result.modelo == "Yaris"
    assert result.color == "Blanco"
    assert result.año == 2020


@respx.mock
@pytest.mark.asyncio
async def test_vehiculo_not_found():
    respx.post("https://api.json.pe/api/placa").mock(
        return_value=Response(200, json={"success": False})
    )
    result = await JsonPeVehiculoAdapter().consultar("XXX000")
    assert result is None


# ---------------------------------------------------------------------------
# Licencia
# ---------------------------------------------------------------------------

@respx.mock
@pytest.mark.asyncio
async def test_licencia_ok():
    respx.post("https://api.json.pe/api/licencia").mock(
        return_value=Response(200, json=_fixture("jsonpe_licencia.json"))
    )
    result = await JsonPeLicenciaAdapter().consultar("12345678")
    assert result is not None
    assert result.vigente is True
    assert result.categoria == "A2"
    assert result.fecha_vencimiento is not None


@respx.mock
@pytest.mark.asyncio
async def test_licencia_vencida():
    respx.post("https://api.json.pe/api/licencia").mock(
        return_value=Response(200, json={
            "success": True,
            "data": {
                "licencia": {
                    "estado": "VENCIDO",
                    "categoria": "B2",
                    "fecha_vencimiento": "15/03/2022"
                }
            }
        })
    )
    result = await JsonPeLicenciaAdapter().consultar("87654321")
    assert result is not None
    assert result.vigente is False
    assert result.categoria == "B2"


@respx.mock
@pytest.mark.asyncio
async def test_licencia_not_found():
    respx.post("https://api.json.pe/api/licencia").mock(
        return_value=Response(200, json={"success": False})
    )
    result = await JsonPeLicenciaAdapter().consultar("00000000")
    assert result is None
