from app.contratos.domain.ports import IContractAnalyzerPort, ContratoAnalysis


class ContractAnalyzer:
    def __init__(self, adapter: IContractAnalyzerPort):
        self._adapter = adapter

    async def analizar(self, texto: str) -> ContratoAnalysis:
        return await self._adapter.analizar(texto)
