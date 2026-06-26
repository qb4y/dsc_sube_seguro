from contextlib import asynccontextmanager
from datetime import datetime

import httpx

from app.config import get_settings
from app.verificacion.domain.models import LicenciaInfo, RevisionTecnicaInfo, SoatInfo, VehiculoInfo
from app.verificacion.domain.ports import ILicenciaPort, IRevisionTecnicaPort, ISoatPort, IVehiculoPort


def _make_client() -> httpx.AsyncClient:
    s = get_settings()
    return httpx.AsyncClient(
        base_url=s.jsonpe_base_url,
        headers={"Authorization": f"Bearer {s.jsonpe_token}"},
        timeout=10.0,
        limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
    )


def _parse_date(raw: str | None) -> datetime | None:
    if not raw:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt)
        except (ValueError, TypeError):
            pass
    return None


class JsonPeSoatAdapter(ISoatPort):
    async def consultar(self, placa: str) -> SoatInfo | None:
        async with _make_client() as client:
            r = await client.post("/api/soat", json={"placa": placa})
        r.raise_for_status()
        resp = r.json()
        if not resp.get("success"):
            return None
        data = resp["data"]
        return SoatInfo(
            vigente=data.get("estado") == "VIGENTE",
            fecha_vencimiento=_parse_date(data.get("fecha_fin")),
            aseguradora=data.get("nombre_compania"),
        )


class JsonPeVehiculoAdapter(IVehiculoPort):
    async def consultar(self, placa: str) -> VehiculoInfo | None:
        async with _make_client() as client:
            r = await client.post("/api/placa", json={"placa": placa})
        r.raise_for_status()
        resp = r.json()
        if not resp.get("success"):
            return None
        data = resp["data"]
        return VehiculoInfo(
            placa=placa,
            marca=data.get("marca") or None,
            modelo=data.get("modelo") or None,
            color=data.get("color") or None,
            anio=data.get("anio") or None,
        )


class JsonPeRevisionTecnicaAdapter(IRevisionTecnicaPort):
    async def consultar(self, placa: str) -> RevisionTecnicaInfo | None:
        async with _make_client() as client:
            r = await client.post("/api/revision-tecnica", json={"placa": placa})
        r.raise_for_status()
        resp = r.json()
        if not resp.get("success"):
            return None
        items = resp.get("data", [])
        if not items:
            return None
        latest = items[0]
        return RevisionTecnicaInfo(
            vigente=latest.get("estado") == "VIGENTE" and latest.get("resultado_inspeccion") == "APROBADO",
            fecha_vencimiento=_parse_date(latest.get("vigente_hasta")),
            empresa_certificadora=latest.get("empresa_certificadora"),
            numero_certificado=latest.get("numero_certificado"),
        )


class JsonPeLicenciaAdapter(ILicenciaPort):
    async def consultar(self, dni: str) -> LicenciaInfo | None:
        async with _make_client() as client:
            r = await client.post("/api/licencia", json={"dni": dni})
        if r.status_code == 404:
            return None
        r.raise_for_status()
        resp = r.json()
        if not resp.get("success"):
            return None
        data = resp.get("data", {})
        raw = data.get("licencia")
        if not raw:
            return None
        lic = raw[0] if isinstance(raw, list) else raw
        return LicenciaInfo(
            categoria=lic.get("categoria"),
            vigente=lic.get("estado") == "VIGENTE",
            fecha_vencimiento=_parse_date(lic.get("fecha_vencimiento")),
            nombre_completo=data.get("nombre_completo"),
            restricciones=lic.get("restricciones"),
        )
