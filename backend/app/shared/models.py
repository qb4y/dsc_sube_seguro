from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel


class Color(str, Enum):
    verde = "verde"
    ambar = "ambar"
    rojo = "rojo"
    desconocido = "desconocido"


_COLOR_RANK = {Color.verde: 0, Color.ambar: 1, Color.desconocido: 1, Color.rojo: 2}


def worst_color(*colors: Color) -> Color:
    worst = max(colors, key=lambda c: _COLOR_RANK[c])
    return Color.ambar if worst == Color.desconocido else worst


class Check(BaseModel):
    clave: str
    etiqueta: str
    color: Color
    detalle: str
    fuente: str
    consultado_en: datetime


class Veredicto(BaseModel):
    color: Color
    resumen: str
    placa: str
    checks: list[Check]


_RESUMEN = {
    Color.verde: "Todo en orden. Puedes subir con confianza.",
    Color.ambar: "Precaución: revisa los detalles antes de subir.",
    Color.rojo: "Riesgo: revisa las alertas antes de subir.",
}


def build_veredicto(placa: str, checks: list[Check]) -> Veredicto:
    color = worst_color(*[c.color for c in checks]) if checks else Color.ambar
    return Veredicto(color=color, resumen=_RESUMEN[color], placa=placa, checks=checks)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
