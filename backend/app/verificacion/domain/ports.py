from abc import ABC, abstractmethod
from app.verificacion.domain.models import SoatInfo, VehiculoInfo, LicenciaInfo, RevisionTecnicaInfo


class ISoatPort(ABC):
    @abstractmethod
    async def consultar(self, placa: str) -> SoatInfo | None: ...


class IVehiculoPort(ABC):
    @abstractmethod
    async def consultar(self, placa: str) -> VehiculoInfo | None: ...


class IRevisionTecnicaPort(ABC):
    @abstractmethod
    async def consultar(self, placa: str) -> RevisionTecnicaInfo | None: ...


class ILicenciaPort(ABC):
    @abstractmethod
    async def consultar(self, dni: str) -> LicenciaInfo | None: ...
