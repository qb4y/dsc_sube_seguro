import httpx

from app.verificacion.domain.models import SoatInfo
from app.verificacion.domain.ports import ISoatPort

APESEG_URL = "https://www.apeseg.org.pe/index.php/consulta-soat/"


class ApeSegScraper(ISoatPort):
    """SOAT fallback when json.pe lacks data."""

    async def consultar(self, placa: str) -> SoatInfo | None:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(APESEG_URL, data={"placa": placa})
                resp.raise_for_status()
            vigente = "VIGENTE" in resp.text.upper()
            return SoatInfo(vigente=vigente)
        except Exception:
            return None
