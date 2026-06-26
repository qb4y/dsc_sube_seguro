from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel, field_validator

from app.config import get_settings
from app.contratos.application.analyzer import ContractAnalyzer
from app.contratos.infrastructure.claude import ClaudeContractAdapter
from app.shared.cache import TTLCache
from app.shared.models import Veredicto
from app.verificacion.application.aggregator import VerificacionAggregator
from app.verificacion.infrastructure.jsonpe import JsonPeSoatAdapter, JsonPeVehiculoAdapter

router = APIRouter(prefix="/verificar", tags=["verificacion"])

_cache = TTLCache(ttl_seconds=get_settings().cache_ttl_seconds)


def _make_aggregator() -> VerificacionAggregator:
    return VerificacionAggregator(
        soat_port=JsonPeSoatAdapter(),
        vehiculo_port=JsonPeVehiculoAdapter(),
        cache=_cache,
    )


class PasajeroRequest(BaseModel):
    placa: str

    @field_validator("placa")
    @classmethod
    def placa_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("placa no puede estar vacía")
        return v


@router.post("/pasajero", response_model=Veredicto)
async def verificar_pasajero(req: PasajeroRequest):
    return await _make_aggregator().verificar_pasajero(req.placa)


@router.post("/comprador")
async def verificar_comprador(
    placa: str = Form(...),
    contrato: UploadFile | None = File(None),
):
    veredicto = await _make_aggregator().verificar_pasajero(placa)

    contrato_result = None
    if contrato:
        content = await contrato.read()
        analyzer = ContractAnalyzer(adapter=ClaudeContractAdapter())
        analysis = await analyzer.analizar(content.decode("utf-8", errors="replace"))
        contrato_result = {"alertas": analysis.alertas, "resumen": analysis.resumen}

    return {"veredicto": veredicto, "contrato": contrato_result}
