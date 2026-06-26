from datetime import datetime, timezone, timedelta

from app.shared.models import Color
from app.verificacion.domain.models import SoatInfo, VehiculoInfo
from app.verificacion.application.scoring import score_soat, score_vehiculo


def test_soat_vigente():
    info = SoatInfo(vigente=True, fecha_vencimiento=datetime.now(timezone.utc) + timedelta(days=90))
    assert score_soat(info, "json.pe").color == Color.verde


def test_soat_vencido():
    assert score_soat(SoatInfo(vigente=False), "json.pe").color == Color.rojo


def test_soat_por_vencer():
    info = SoatInfo(vigente=True, fecha_vencimiento=datetime.now(timezone.utc) + timedelta(days=15))
    assert score_soat(info, "json.pe").color == Color.ambar


def test_soat_none_es_ambar():
    assert score_soat(None, "json.pe").color == Color.ambar


def test_vehiculo_ok():
    info = VehiculoInfo(placa="ABC123", marca="Toyota", modelo="Yaris", color="Blanco")
    assert score_vehiculo(info, "ABC123", "json.pe").color == Color.verde


def test_vehiculo_none_es_ambar():
    assert score_vehiculo(None, "ABC123", "json.pe").color == Color.ambar
