from datetime import datetime
from pydantic import BaseModel


class Report(BaseModel):
    report_id: str
    placa: str
    dni: str
    created_at: datetime
    signature: str
