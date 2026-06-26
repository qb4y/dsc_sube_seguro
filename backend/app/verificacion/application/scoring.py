from datetime import datetime, timezone
from app.shared.models import Check, Color, now_utc
from app.verificacion.domain.models import SoatInfo, VehiculoInfo


def score_soat(info: SoatInfo | None, fuente: str) -> Check:
    ts = now_utc()
    if info is None:
        return Check(
            clave="soat", etiqueta="SOAT", color=Color.ambar,
            detalle="No pudimos consultar el SOAT.",
            fuente=fuente, consultado_en=ts,
        )
    if not info.vigente:
        return Check(
            clave="soat", etiqueta="SOAT", color=Color.rojo,
            detalle="SOAT vencido. No es seguro subir.",
            fuente=fuente, consultado_en=ts,
        )
    if info.fecha_vencimiento:
        days_left = (
            info.fecha_vencimiento.replace(tzinfo=timezone.utc)
            - datetime.now(timezone.utc)
        ).days
        if days_left <= 30:
            return Check(
                clave="soat", etiqueta="SOAT", color=Color.ambar,
                detalle=f"SOAT vence en {days_left} días.",
                fuente=fuente, consultado_en=ts,
            )
    return Check(
        clave="soat", etiqueta="SOAT", color=Color.verde,
        detalle="SOAT vigente.",
        fuente=fuente, consultado_en=ts,
    )


def score_vehiculo(info: VehiculoInfo | None, placa: str, fuente: str) -> Check:
    ts = now_utc()
    if info is None:
        return Check(
            clave="vehiculo", etiqueta="Vehículo", color=Color.ambar,
            detalle="No pudimos consultar los datos del vehículo.",
            fuente=fuente, consultado_en=ts,
        )
    desc = f"{info.marca or '?'} {info.modelo or '?'}, color {info.color or '?'}."
    return Check(
        clave="vehiculo", etiqueta="Vehículo", color=Color.verde,
        detalle=desc, fuente=fuente, consultado_en=ts,
    )
