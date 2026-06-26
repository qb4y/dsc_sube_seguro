from datetime import datetime

import httpx

from app.config import get_settings
from app.verificacion.domain.models import LicenciaInfo, RevisionTecnicaInfo, SoatInfo, VehiculoInfo
from app.verificacion.domain.ports import ILicenciaPort, IRevisionTecnicaPort, ISoatPort, IVehiculoPort

# Shared client with connection pooling — avoids TCP handshake overhead per request
_shared_client: httpx.AsyncClient | None = None


def _client() -> httpx.AsyncClient:
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        s = get_settings()
        _shared_client = httpx.AsyncClient(
            base_url=s.jsonpe_base_url,
            headers={"Authorization": f"Bearer {s.jsonpe_token}"},
            timeout=8.0,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
    return _shared_client


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
        r = await _client().post("/api/soat", json={"placa": placa})
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
        r = await _client().post("/api/placa", json={"placa": placa})
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
        r = await _client().post("/api/revision-tecnica", json={"placa": placa})
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
        r = await _client().post("/api/licencia", json={"dni": dni})
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
