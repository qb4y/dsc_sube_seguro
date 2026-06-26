from app.shared.models import Veredicto, build_veredicto
from app.shared.cache import TTLCache
from app.verificacion.domain.ports import ISoatPort, IVehiculoPort
from app.verificacion.application.scoring import score_soat, score_vehiculo


def _normalize(placa: str) -> str:
    return placa.upper().replace("-", "").replace(" ", "")


class VerificacionAggregator:
    def __init__(
        self,
        soat_port: ISoatPort,
        vehiculo_port: IVehiculoPort,
        cache: TTLCache,
    ):
        self._soat = soat_port
        self._vehiculo = vehiculo_port
        self._cache = cache

    async def verificar_pasajero(self, placa_raw: str) -> Veredicto:
        placa = _normalize(placa_raw)
        cached = self._cache.get(f"pasajero:{placa}")
        if cached:
            return cached

        soat_info, soat_fuente = None, "json.pe"
        try:
            soat_info = await self._soat.consultar(placa)
        except Exception:
            pass

        vehiculo_info, vehiculo_fuente = None, "json.pe"
        try:
            vehiculo_info = await self._vehiculo.consultar(placa)
        except Exception:
            pass

        checks = [
            score_soat(soat_info, soat_fuente),
            score_vehiculo(vehiculo_info, placa, vehiculo_fuente),
        ]
        veredicto = build_veredicto(placa, checks)
        self._cache.set(f"pasajero:{placa}", veredicto)
        return veredicto
