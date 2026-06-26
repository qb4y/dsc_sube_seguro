from unittest.mock import AsyncMock

import pytest

from app.contratos.application.analyzer import ContractAnalyzer
from app.contratos.domain.ports import ContratoAnalysis


@pytest.mark.asyncio
async def test_delega_al_adaptador():
    adapter = AsyncMock()
    adapter.analizar.return_value = ContratoAnalysis(
        alertas=["Cláusula 3 es riesgosa"],
        resumen="Contrato estándar de compraventa.",
    )
    analyzer = ContractAnalyzer(adapter=adapter)
    result = await analyzer.analizar("texto del contrato")
    assert len(result.alertas) == 1
    assert "riesgosa" in result.alertas[0]
    adapter.analizar.assert_called_once_with("texto del contrato")
