import asyncio

from app.shared.models import Veredicto, build_veredicto
from app.shared.cache import TTLCache
from app.verificacion.domain.ports import ISoatPort, IVehiculoPort, IRevisionTecnicaPort
from app.verificacion.application.scoring import score_soat, score_vehiculo, score_revision_tecnica


def _normalize(placa: str) -> str:
    return placa.upper().replace("-", "").replace(" ", "")


class VerificacionAggregator:
    def __init__(
        self,
        soat_port: ISoatPort,
        vehiculo_port: IVehiculoPort,
        cache: TTLCache,
        soat_fallback: ISoatPort | None = None,
        revision_tecnica_port: IRevisionTecnicaPort | None = None,
    ):
        self._soat = soat_port
        self._vehiculo = vehiculo_port
        self._cache = cache
        self._soat_fallback = soat_fallback
        self._revision_tecnica = revision_tecnica_port

    async def verificar_pasajero(self, placa_raw: str) -> Veredicto:
        placa = _normalize(placa_raw)
        cached = self._cache.get(f"pasajero:{placa}")
        if cached:
            return cached

        tasks = [
            self._fetch_soat(placa),
            self._safe(self._vehiculo.consultar(placa)),
            self._safe(self._revision_tecnica.consultar(placa)) if self._revision_tecnica else asyncio.sleep(0),
        ]

        soat_info, vehiculo_info, rev_info = await asyncio.gather(*tasks)

        checks = [
            score_soat(soat_info, "json.pe"),
            score_vehiculo(vehiculo_info, placa, "json.pe"),
        ]
        if self._revision_tecnica:
            checks.append(score_revision_tecnica(rev_info, "json.pe"))

        veredicto = build_veredicto(placa, checks)
        self._cache.set(f"pasajero:{placa}", veredicto)
        return veredicto

    async def _fetch_soat(self, placa: str):
        result = await self._safe(self._soat.consultar(placa))
        if result is not None:
            return result
        if self._soat_fallback:
            return await self._safe(self._soat_fallback.consultar(placa))
        return None

    @staticmethod
    async def _safe(coro):
        try:
            return await coro
        except Exception:
            return None
