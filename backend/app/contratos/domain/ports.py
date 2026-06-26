from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ContratoAnalysis:
    alertas: list[str] = field(default_factory=list)
    resumen: str = ""


class IContractAnalyzerPort(ABC):
    @abstractmethod
    async def analizar(self, texto: str) -> ContratoAnalysis: ...
