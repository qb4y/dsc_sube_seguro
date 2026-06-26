import hashlib
import secrets
from datetime import datetime, timezone

from app.conductor.domain.models import Report
from app.config import get_settings
from app.db import get_db


def _make_report(report_id: str, placa: str, dni: str, created_at: datetime) -> Report:
    settings = get_settings()
    payload = f"{report_id}:{placa}:{dni}:{created_at.isoformat()}:{settings.app_secret}"
    signature = hashlib.sha256(payload.encode()).hexdigest()
    return Report(report_id=report_id, placa=placa, dni=dni, created_at=created_at, signature=signature)


async def create_report(placa: str, dni: str) -> Report:
    report_id = secrets.token_urlsafe(16)
    created_at = datetime.now(timezone.utc)
    report = _make_report(report_id, placa, dni, created_at)
    async with get_db() as db:
        await db.execute(
            "INSERT INTO reports (report_id, placa, dni, created_at, signature) VALUES (?, ?, ?, ?, ?)",
            (report.report_id, report.placa, report.dni, report.created_at.isoformat(), report.signature),
        )
        await db.commit()
    return report


async def get_report(report_id: str) -> Report | None:
    async with get_db() as db:
        async with db.execute(
            "SELECT report_id, placa, dni, created_at, signature FROM reports WHERE report_id = ?",
            (report_id,),
        ) as cursor:
            row = await cursor.fetchone()
    if not row:
        return None
    return Report(
        report_id=row["report_id"],
        placa=row["placa"],
        dni=row["dni"],
        created_at=datetime.fromisoformat(row["created_at"]),
        signature=row["signature"],
    )
