from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.conductor.application.qr import generate_qr_png
from app.conductor.application.report import create_report, get_report
from app.config import get_settings
from app.shared.cache import TTLCache
from app.shared.models import Veredicto
from app.verificacion.application.aggregator import VerificacionAggregator
from app.verificacion.infrastructure.jsonpe import (
    JsonPeSoatAdapter,
    JsonPeVehiculoAdapter,
    JsonPeRevisionTecnicaAdapter,
    JsonPeLicenciaAdapter,
)
from app.verificacion.infrastructure.apeseg import ApeSegScraper

router = APIRouter(prefix="/conductor", tags=["conductor"])


class QRRequest(BaseModel):
    placa: str
    dni: str


def _make_aggregator() -> VerificacionAggregator:
    return VerificacionAggregator(
        soat_port=JsonPeSoatAdapter(),
        vehiculo_port=JsonPeVehiculoAdapter(),
        cache=TTLCache(ttl_seconds=0),
        soat_fallback=ApeSegScraper(),
        revision_tecnica_port=JsonPeRevisionTecnicaAdapter(),
        licencia_port=JsonPeLicenciaAdapter(),
    )


@router.post("/qr")
async def conductor_qr(req: QRRequest):
    report = await create_report(placa=req.placa, dni=req.dni)
    return {"report_id": report.report_id, "qr_url": f"/conductor/verify/{report.report_id}"}


@router.get("/verify/{report_id}", response_model=Veredicto)
async def conductor_verify(report_id: str):
    report = await get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado.")
    return await _make_aggregator().verificar_conductor(report.placa, report.dni)


@router.get("/qr.png")
async def conductor_qr_png(report_id: str):
    report = await get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado.")
    base = get_settings().public_url.rstrip("/")
    url = f"{base}/conductor/verify/{report_id}"
    return Response(content=generate_qr_png(url), media_type="image/png")
