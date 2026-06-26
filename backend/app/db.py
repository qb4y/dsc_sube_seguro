import os
from contextlib import asynccontextmanager

import aiosqlite

_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "reports.db")


@asynccontextmanager
async def get_db():
    async with aiosqlite.connect(_DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db


async def init_db() -> None:
    async with aiosqlite.connect(_DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                report_id TEXT PRIMARY KEY,
                placa     TEXT NOT NULL,
                dni       TEXT NOT NULL,
                created_at TEXT NOT NULL,
                signature TEXT NOT NULL
            )
        """)
        await db.commit()
