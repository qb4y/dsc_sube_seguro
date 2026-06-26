from datetime import datetime, timezone
from app.shared.models import Check, Color, now_utc
from app.verificacion.domain.models import SoatInfo, VehiculoInfo, RevisionTecnicaInfo, LicenciaInfo


def score_soat(info: SoatInfo | None, fuente: str) -> Check:
    ts = now_utc()
    if info is None:
        return Check(
            clave="soat", etiqueta="SOAT", color=Color.ambar,
            detalle="No pudimos consultar el SOAT.",
            fuente=fuente, consultado_en=ts,
        )
    if info.sin_registro:
        return Check(
            clave="soat", etiqueta="SOAT", color=Color.rojo,
            detalle="Sin SOAT registrado. No es seguro subir.",
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
    aseg = f" · {info.aseguradora}" if info.aseguradora else ""
    return Check(
        clave="soat", etiqueta="SOAT", color=Color.verde,
        detalle=f"SOAT vigente{aseg}.",
        fuente=fuente, consultado_en=ts,
    )


def score_revision_tecnica(info: RevisionTecnicaInfo | None, fuente: str) -> Check:
    ts = now_utc()
    if info is None:
        return Check(
            clave="revision_tecnica", etiqueta="Revisión Técnica", color=Color.ambar,
            detalle="No pudimos consultar la revisión técnica.",
            fuente=fuente, consultado_en=ts,
        )
    if info.sin_registro:
        return Check(
            clave="revision_tecnica", etiqueta="Revisión Técnica", color=Color.rojo,
            detalle="Sin revisión técnica registrada.",
            fuente=fuente, consultado_en=ts,
        )
    if not info.vigente:
        return Check(
            clave="revision_tecnica", etiqueta="Revisión Técnica", color=Color.rojo,
            detalle="Revisión técnica vencida. No es seguro subir.",
            fuente=fuente, consultado_en=ts,
        )
    return Check(
        clave="revision_tecnica", etiqueta="Revisión Técnica", color=Color.verde,
        detalle="Revisión técnica aprobada y vigente.",
        fuente=fuente, consultado_en=ts,
    )


def score_licencia(info: LicenciaInfo | None, fuente: str) -> Check:
    ts = now_utc()
    if info is None:
        return Check(
            clave="licencia", etiqueta="Licencia de conducir", color=Color.ambar,
            detalle="No pudimos consultar la licencia.",
            fuente=fuente, consultado_en=ts,
        )
    if not info.vigente:
        nombre = f" · {info.nombre_completo}" if info.nombre_completo else ""
        return Check(
            clave="licencia", etiqueta="Licencia de conducir", color=Color.rojo,
            detalle=f"Licencia vencida o no habilitada{nombre}.",
            fuente=fuente, consultado_en=ts,
        )
    cat = f" · Categoría {info.categoria}" if info.categoria else ""
    nombre = f" · {info.nombre_completo}" if info.nombre_completo else ""
    restricciones = f" · {info.restricciones}" if info.restricciones and info.restricciones != "SIN RESTRICCIONES" else ""
    return Check(
        clave="licencia", etiqueta="Licencia de conducir", color=Color.verde,
        detalle=f"Licencia vigente{cat}{nombre}{restricciones}.",
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
    # Pipe-separated so frontend can parse reliably without word-position guessing
    desc = f"{info.marca or '?'}|{info.modelo or '?'}|{info.color or '?'}"
    return Check(
        clave="vehiculo", etiqueta="Vehículo", color=Color.verde,
        detalle=desc, fuente=fuente, consultado_en=ts,
    )
