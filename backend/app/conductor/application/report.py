import hashlib
import secrets
from datetime import datetime, timezone

from app.conductor.domain.models import Report
from app.config import get_settings

_store: dict[str, Report] = {}


def create_report(placa: str, dni: str) -> Report:
    settings = get_settings()
    report_id = secrets.token_urlsafe(16)
    created_at = datetime.now(timezone.utc)
    payload = f"{report_id}:{placa}:{dni}:{created_at.isoformat()}:{settings.app_secret}"
    signature = hashlib.sha256(payload.encode()).hexdigest()
    report = Report(
        report_id=report_id,
        placa=placa,
        dni=dni,
        created_at=created_at,
        signature=signature,
    )
    _store[report_id] = report
    return report


def get_report(report_id: str) -> Report | None:
    return _store.get(report_id)
