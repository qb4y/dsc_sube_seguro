from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel


class Color(str, Enum):
    verde = "verde"
    ambar = "ambar"
    rojo = "rojo"
    desconocido = "desconocido"


_COLOR_RANK = {Color.verde: 0, Color.ambar: 1, Color.desconocido: 1, Color.rojo: 2}

# Points per check key (verde / ambar / rojo)
_CHECK_POINTS: dict[str, tuple[int, int, int]] = {
    "soat":             (40, 15, 0),
    "revision_tecnica": (30, 10, 0),
    "licencia":         (30, 10, 0),
    "vehiculo":         (0,  0,  0),  # informational only
}
_MAX_WITHOUT_CONDUCTOR = 70
_MAX_TOTAL = 100


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
    score: int = 0


_RESUMEN = {
    Color.verde: "Todo en orden. Puedes subir con confianza.",
    Color.ambar: "Precaución: revisa los detalles antes de subir.",
    Color.rojo: "Riesgo: revisa las alertas antes de subir.",
}


def _calc_score(checks: list[Check]) -> int:
    total = 0
    for c in checks:
        pts = _CHECK_POINTS.get(c.clave)
        if pts is None:
            continue
        verde_pts, ambar_pts, _ = pts
        if c.color == Color.verde:
            total += verde_pts
        elif c.color == Color.ambar:
            total += ambar_pts
    return min(total, _MAX_TOTAL)


def build_veredicto(placa: str, checks: list[Check]) -> Veredicto:
    color = worst_color(*[c.color for c in checks]) if checks else Color.ambar
    return Veredicto(
        color=color,
        resumen=_RESUMEN[color],
        placa=placa,
        checks=checks,
        score=_calc_score(checks),
    )


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
