import json

from anthropic import AsyncAnthropic

from app.config import get_settings
from app.contratos.domain.ports import ContratoAnalysis, IContractAnalyzerPort

_SYSTEM = """Eres un asistente legal peruano especializado en contratos de compraventa de vehículos.
Analiza el contrato y devuelve únicamente un objeto JSON con:
- "alertas": lista de hasta 5 cláusulas riesgosas o irregulares (strings en español)
- "resumen": resumen de 1-2 oraciones sobre el contrato

Solo devuelve JSON, sin texto adicional."""


class ClaudeContractAdapter(IContractAnalyzerPort):
    async def analizar(self, texto: str) -> ContratoAnalysis:
        settings = get_settings()
        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        msg = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=_SYSTEM,
            messages=[{"role": "user", "content": f"Contrato:\n\n{texto[:8000]}"}],
        )
        raw = msg.content[0].text.strip()
        try:
            data = json.loads(raw)
            return ContratoAnalysis(
                alertas=data.get("alertas", []),
                resumen=data.get("resumen", ""),
            )
        except json.JSONDecodeError:
            return ContratoAnalysis(resumen=raw)
