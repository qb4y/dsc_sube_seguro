import requests

from app.shared.models import Check, Color, now_utc

CITV_URL = "https://portales.mtc.gob.pe/citv/consulta"


class CitvScraper:
    """Revisión técnica fallback."""

    async def consultar(self, placa: str) -> Check:
        try:
            resp = requests.get(f"{CITV_URL}?placa={placa}", timeout=15)
            resp.raise_for_status()
            vigente = "APROBADO" in resp.text.upper()
            return Check(
                clave="revision_tecnica",
                etiqueta="Revisión Técnica",
                color=Color.verde if vigente else Color.rojo,
                detalle="Revisión técnica aprobada." if vigente else "Revisión técnica no aprobada.",
                fuente="MTC CITV",
                consultado_en=now_utc(),
            )
        except Exception:
            return Check(
                clave="revision_tecnica",
                etiqueta="Revisión Técnica",
                color=Color.ambar,
                detalle="No pudimos consultar la revisión técnica.",
                fuente="MTC CITV",
                consultado_en=now_utc(),
            )
