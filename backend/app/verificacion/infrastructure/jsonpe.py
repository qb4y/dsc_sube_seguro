from datetime import datetime

import httpx

from app.config import get_settings
from app.verificacion.domain.models import LicenciaInfo, RevisionTecnicaInfo, SoatInfo, VehiculoInfo
from app.verificacion.domain.ports import ILicenciaPort, IRevisionTecnicaPort, ISoatPort, IVehiculoPort


def _client() -> httpx.AsyncClient:
    s = get_settings()
    return httpx.AsyncClient(
        base_url=s.jsonpe_base_url,
        headers={"Authorization": f"Bearer {s.jsonpe_token}"},
        timeout=15.0,
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
        async with _client() as client:
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
        async with _client() as client:
            r = await client.post("/api/placa", json={"placa": placa})
            r.raise_for_status()
            resp = r.json()
        if not resp.get("success"):
            return None
        data = resp["data"]
        return VehiculoInfo(
            placa=placa,
            marca=data.get("marca"),
            modelo=data.get("modelo"),
            color=data.get("color"),
            año=data.get("anio"),
        )


class JsonPeRevisionTecnicaAdapter(IRevisionTecnicaPort):
    async def consultar(self, placa: str) -> RevisionTecnicaInfo | None:
        async with _client() as client:
            r = await client.post("/api/revision-tecnica", json={"placa": placa})
            r.raise_for_status()
            resp = r.json()
        if not resp.get("success"):
            return None
        items = resp.get("data", [])
        if not items:
            return None
        # First item is always the most recent (orden: ULTIMO)
        latest = items[0]
        return RevisionTecnicaInfo(
            vigente=latest.get("estado") == "VIGENTE" and latest.get("resultado_inspeccion") == "APROBADO",
            fecha_vencimiento=_parse_date(latest.get("vigente_hasta")),
            empresa_certificadora=latest.get("empresa_certificadora"),
            numero_certificado=latest.get("numero_certificado"),
        )


class JsonPeLicenciaAdapter(ILicenciaPort):
    async def consultar(self, dni: str) -> LicenciaInfo | None:
        async with _client() as client:
            r = await client.post("/api/licencia", json={"dni": dni})
            r.raise_for_status()
            resp = r.json()
        if not resp.get("success"):
            return None
        licencia = resp["data"].get("licencia", {})
        return LicenciaInfo(
            categoria=licencia.get("categoria"),
            vigente=licencia.get("estado") == "VIGENTE",
            fecha_vencimiento=_parse_date(licencia.get("fecha_vencimiento")),
        )
