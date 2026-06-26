from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock

import pytest

from app.shared.cache import TTLCache
from app.shared.models import Color
from app.verificacion.application.aggregator import VerificacionAggregator
from app.verificacion.domain.models import SoatInfo, VehiculoInfo


@pytest.fixture
def parts():
    soat = AsyncMock()
    vehiculo = AsyncMock()
    cache = TTLCache(ttl_seconds=60)
    agg = VerificacionAggregator(soat_port=soat, vehiculo_port=vehiculo, cache=cache)
    return agg, soat, vehiculo, cache


@pytest.mark.asyncio
async def test_veredicto_verde(parts):
    agg, soat, vehiculo, _ = parts
    soat.consultar.return_value = SoatInfo(vigente=True, fecha_vencimiento=datetime.now(timezone.utc) + timedelta(days=90))
    vehiculo.consultar.return_value = VehiculoInfo(placa="ABC123", marca="Toyota")
    v = await agg.verificar_pasajero("ABC123")
    assert v.color == Color.verde


@pytest.mark.asyncio
async def test_veredicto_rojo_soat_vencido(parts):
    agg, soat, vehiculo, _ = parts
    soat.consultar.return_value = SoatInfo(vigente=False)
    vehiculo.consultar.return_value = VehiculoInfo(placa="ABC123")
    v = await agg.verificar_pasajero("ABC123")
    assert v.color == Color.rojo


@pytest.mark.asyncio
async def test_cache_hit(parts):
    agg, soat, vehiculo, _ = parts
    soat.consultar.return_value = SoatInfo(vigente=True)
    vehiculo.consultar.return_value = VehiculoInfo(placa="ABC123")
    await agg.verificar_pasajero("ABC123")
    await agg.verificar_pasajero("ABC123")
    assert soat.consultar.call_count == 1


@pytest.mark.asyncio
async def test_normaliza_placa(parts):
    agg, soat, vehiculo, _ = parts
    soat.consultar.return_value = SoatInfo(vigente=True)
    vehiculo.consultar.return_value = VehiculoInfo(placa="ABC123")
    v = await agg.verificar_pasajero("abc-123")
    assert v.placa == "ABC123"


@pytest.mark.asyncio
async def test_fuente_caida_devuelve_ambar(parts):
    agg, soat, vehiculo, _ = parts
    soat.consultar.side_effect = Exception("timeout")
    vehiculo.consultar.side_effect = Exception("timeout")
    v = await agg.verificar_pasajero("ABC123")
    assert v.color == Color.ambar
