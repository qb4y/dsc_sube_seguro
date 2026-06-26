from datetime import datetime
from pydantic import BaseModel


class SoatInfo(BaseModel):
    vigente: bool
    fecha_vencimiento: datetime | None = None
    aseguradora: str | None = None


class VehiculoInfo(BaseModel):
    placa: str
    marca: str | None = None
    modelo: str | None = None
    color: str | None = None
    año: int | None = None


class LicenciaInfo(BaseModel):
    categoria: str | None = None
    vigente: bool
    fecha_vencimiento: datetime | None = None
