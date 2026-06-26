# SubeSeguro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile app that, from a vehicle plate (and optional DNI/contract), returns a 🔴/🟡/🟢 safety verdict by combining official Peruvian-state data (json.pe + targeted scraping), with a shareable "Comparte tu viaje" WhatsApp card and a verified-driver QR.

**Architecture:** A FastAPI backend (Part A) owns all data access — it holds the json.pe Bearer token, normalizes provider JSON into stable internal models, falls back to scraping when json.pe lacks a datum, caches by plate, computes a worst-of-signals verdict, runs OCR/vision/contract AI, and signs reports with SHA-256. An Expo (React Native + TypeScript) app (Part B) is a thin client: it captures plate photos/text, calls the backend, renders the semáforo + per-check detail, shares trip cards via WhatsApp, and shows/scans driver QRs. The two subsystems are independent — backend ships and is testable on its own; the app consumes its HTTP contract.

**Tech Stack:** Backend — Python 3.11+, FastAPI, Uvicorn, httpx, pydantic v2, pydantic-settings, BeautifulSoup4, Playwright (SUNARP only), EasyOCR, qrcode, anthropic; tests with pytest + respx. Mobile — Expo SDK 51+, React Native, TypeScript, expo-router, expo-camera/expo-image-picker, expo-barcode-scanner, axios; tests with jest + @testing-library/react-native.

## Global Constraints

- Python: 3.11+ (system has 3.9 — create a 3.11 venv; do not target 3.9).
- Node: 20+ (env has 26). Expo SDK: 51+.
- Backend never persists vehicle data to disk — only an in-memory TTL cache (privacy principle: "el Estado es la fuente").
- Every check result MUST carry `fuente` (source name) and `consultado_en` (UTC ISO-8601 timestamp).
- Verdict color is the WORST of all individual signals: any 🔴 ⇒ 🔴; else any 🟡 ⇒ 🟡; else 🟢. Unknown/error signals count as 🟡 (precaución), never 🟢.
- All user-facing copy is in Spanish (Peru). Plate format: uppercase, no spaces/dashes, e.g. `ABC123`.
- json.pe response shapes are UNVERIFIED (token only, no docs). All json.pe parsing lives behind the adapter in Task A3 and is validated against the live API in Task A4 before any dependent task trusts it.
- Secrets (`JSONPE_TOKEN`, `ANTHROPIC_API_KEY`, `APP_SECRET`) come from env only; never commit them. `.env` is gitignored.
- TDD: write the failing test first, watch it fail, implement minimally, watch it pass, commit. Tests must not hit the network — mock json.pe with `respx`, mock scrapers with fixtures.

---

# Part A — Backend (FastAPI)

All paths in Part A are relative to `backend/`.

## File Structure (Part A)

```
backend/
├── pyproject.toml                 # deps + pytest config
├── .env.example                   # documents required env vars
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app, CORS, router mounting
│   ├── config.py                  # Settings (pydantic-settings)
│   ├── models.py                  # internal pydantic schemas (the stable contract)
│   ├── clients/
│   │   ├── __init__.py
│   │   └── jsonpe.py              # json.pe HTTP client + adapter to internal models
│   ├── scrapers/
│   │   ├── __init__.py
│   │   ├── apeseg.py              # SOAT fallback (requests + BS4)
│   │   └── citv.py                # revisión técnica fallback (requests + BS4)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── cache.py               # in-memory TTL cache
│   │   ├── scoring.py             # signals -> Veredicto (worst-of)
│   │   ├── aggregator.py          # orchestrates clients/scrapers/cache per módulo
│   │   ├── report.py              # SHA-256 signed report + store for QR
│   │   ├── qr.py                  # QR PNG generation
│   │   ├── ocr.py                 # EasyOCR plate reader
│   │   └── contract.py            # Claude contract clause analysis
│   └── routers/
│       ├── __init__.py
│       ├── verificar.py           # POST /verificar/pasajero, /verificar/comprador
│       ├── conductor.py           # POST /conductor/qr, GET /conductor/verify/{id}
│       └── ocr.py                 # POST /ocr/placa
└── tests/
    ├── __init__.py
    ├── conftest.py                # TestClient + fixtures
    ├── fixtures/
    │   ├── jsonpe_soat.json
    │   ├── jsonpe_vehiculo.json
    │   ├── jsonpe_licencia.json
    │   └── apeseg_vigente.html
    ├── test_jsonpe_client.py
    ├── test_scoring.py
    ├── test_cache.py
    ├── test_apeseg.py
    ├── test_citv.py
    ├── test_aggregator.py
    ├── test_report.py
    ├── test_qr.py
    ├── test_verificar.py
    ├── test_conductor.py
    └── test_ocr.py
```

---

### Task A0: Backend scaffold, config, and app skeleton

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/.env.example`
- Create: `backend/app/__init__.py` (empty)
- Create: `backend/app/config.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/__init__.py` (empty)
- Create: `backend/tests/conftest.py`
- Test: `backend/tests/test_health.py`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `app.config.Settings` with fields `jsonpe_base_url: str`, `jsonpe_token: str`, `anthropic_api_key: str = ""`, `app_secret: str = "dev-secret"`, `cache_ttl_seconds: int = 600`, `cors_origins: list[str] = ["*"]`; and a cached accessor `get_settings() -> Settings`.
  - `app.main.app` — the FastAPI instance, with `GET /health` → `{"status": "ok"}`.
  - `backend/tests/conftest.py` exposes a pytest fixture `client` (a `fastapi.testclient.TestClient`).

- [ ] **Step 1: Create venv and write `pyproject.toml`**

Run first:
```bash
cd backend 2>/dev/null || mkdir -p backend && cd backend
python3.11 -m venv .venv || python3 -m venv .venv   # must be 3.11+
. .venv/bin/activate
```

`backend/pyproject.toml`:
```toml
[project]
name = "subeseguro-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.111",
    "uvicorn[standard]>=0.30",
    "httpx>=0.27",
    "pydantic>=2.7",
    "pydantic-settings>=2.3",
    "beautifulsoup4>=4.12",
    "qrcode[pil]>=7.4",
    "python-multipart>=0.0.9",
    "anthropic>=0.34",
]

[project.optional-dependencies]
dev = ["pytest>=8.2", "respx>=0.21", "pytest-asyncio>=0.23"]
ocr = ["easyocr>=1.7", "pillow>=10.3"]
scrape = ["playwright>=1.44"]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

- [ ] **Step 2: Install deps**

Run: `pip install -e ".[dev]"`
Expected: ends with `Successfully installed ... subeseguro-backend-0.1.0`.

- [ ] **Step 3: Write the failing health test**

`backend/tests/test_health.py`:
```python
def test_health_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
```

- [ ] **Step 4: Run it — expect failure (no conftest/app yet)**

Run: `pytest tests/test_health.py -v`
Expected: FAIL — `fixture 'client' not found` (or import error for `app.main`).

- [ ] **Step 5: Write config, app, conftest, env example**

`backend/app/config.py`:
```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    jsonpe_base_url: str = "https://json.pe/api"
    jsonpe_token: str = ""
    anthropic_api_key: str = ""
    app_secret: str = "dev-secret"
    cache_ttl_seconds: int = 600
    cors_origins: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

`backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

app = FastAPI(title="SubeSeguro API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

`backend/tests/conftest.py`:
```python
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
```

`backend/app/__init__.py` and `backend/tests/__init__.py`: empty files.

`backend/.env.example`:
```
JSONPE_BASE_URL=https://json.pe/api
JSONPE_TOKEN=
ANTHROPIC_API_KEY=
APP_SECRET=change-me
CACHE_TTL_SECONDS=600
```

- [ ] **Step 6: Run the test — expect pass**

Run: `pytest tests/test_health.py -v`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat(backend): scaffold FastAPI app with config and health check"
```

---

### Task A1: Internal domain models (the stable contract)

These models are the firewall between volatile provider shapes and everything downstream. Nothing outside `clients/` and `scrapers/` ever sees raw provider JSON.

**Files:**
- Create: `backend/app/models.py`
- Test: `backend/tests/test_models.py`

**Interfaces:**
- Consumes: nothing.
- Produces (all pydantic v2 `BaseModel`):
  - `Color = Literal["verde", "ambar", "rojo", "desconocido"]`
  - `Check(BaseModel)`: `clave: str`, `etiqueta: str`, `color: Color`, `detalle: str`, `fuente: str`, `consultado_en: str` (UTC ISO-8601).
  - `VehiculoInfo(BaseModel)`: `placa: str`, `marca: str | None`, `modelo: str | None`, `color: str | None`, `anio: int | None`, `fuente: str`, `consultado_en: str`.
  - `SoatInfo(BaseModel)`: `placa: str`, `vigente: bool | None`, `aseguradora: str | None`, `vence: str | None` (ISO date), `fuente: str`, `consultado_en: str`.
  - `LicenciaInfo(BaseModel)`: `dni: str`, `nombre: str | None`, `categoria: str | None`, `vigente: bool | None`, `vence: str | None`, `fuente: str`, `consultado_en: str`.
  - `Veredicto(BaseModel)`: `color: Color`, `resumen: str`, `checks: list[Check]`, `placa: str`.
  - Helper `now_iso() -> str` returning current UTC time as ISO-8601 with `Z`.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_models.py`:
```python
from app.models import Check, Veredicto, now_iso


def test_now_iso_is_utc_zulu():
    ts = now_iso()
    assert ts.endswith("Z")
    assert "T" in ts


def test_veredicto_roundtrips():
    chk = Check(
        clave="soat",
        etiqueta="SOAT",
        color="verde",
        detalle="Vigente hasta 2026-12-31",
        fuente="json.pe",
        consultado_en=now_iso(),
    )
    v = Veredicto(color="verde", resumen="Seguro", checks=[chk], placa="ABC123")
    assert v.checks[0].clave == "soat"
    assert v.model_dump()["color"] == "verde"
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_models.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.models'`.

- [ ] **Step 3: Implement `models.py`**

```python
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel

Color = Literal["verde", "ambar", "rojo", "desconocido"]


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Check(BaseModel):
    clave: str
    etiqueta: str
    color: Color
    detalle: str
    fuente: str
    consultado_en: str


class VehiculoInfo(BaseModel):
    placa: str
    marca: str | None = None
    modelo: str | None = None
    color: str | None = None
    anio: int | None = None
    fuente: str
    consultado_en: str


class SoatInfo(BaseModel):
    placa: str
    vigente: bool | None = None
    aseguradora: str | None = None
    vence: str | None = None
    fuente: str
    consultado_en: str


class LicenciaInfo(BaseModel):
    dni: str
    nombre: str | None = None
    categoria: str | None = None
    vigente: bool | None = None
    vence: str | None = None
    fuente: str
    consultado_en: str


class Veredicto(BaseModel):
    color: Color
    resumen: str
    checks: list[Check]
    placa: str
```

- [ ] **Step 4: Run it — expect pass**

Run: `pytest tests/test_models.py -v`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add backend/app/models.py backend/tests/test_models.py
git commit -m "feat(backend): add internal domain models"
```

---

### Task A2: json.pe client + adapter (assumed shapes)

⚠️ The json.pe response shapes here are ASSUMPTIONS. They are isolated in `_adapt_*` functions and locked behind the fixtures in `tests/fixtures/`. Task A4 verifies/corrects them against the live API. Do NOT spread provider field names beyond this file.

**Assumed json.pe contract (to verify in A4):**
- `GET {base}/soat/{placa}` → `{"placa","aseguradora","vigente": bool, "fecha_fin": "YYYY-MM-DD"}`
- `GET {base}/vehiculo/{placa}` → `{"placa","marca","modelo","color","anio": int}`
- `GET {base}/licencia/{dni}` → `{"dni","nombres","categoria","vigente": bool, "fecha_revalidacion":"YYYY-MM-DD"}`
- Auth: header `Authorization: Bearer {token}`.

**Files:**
- Create: `backend/app/clients/__init__.py` (empty)
- Create: `backend/app/clients/jsonpe.py`
- Create: `backend/tests/fixtures/jsonpe_soat.json`
- Create: `backend/tests/fixtures/jsonpe_vehiculo.json`
- Create: `backend/tests/fixtures/jsonpe_licencia.json`
- Test: `backend/tests/test_jsonpe_client.py`

**Interfaces:**
- Consumes: `app.models.{SoatInfo, VehiculoInfo, LicenciaInfo, now_iso}`; `app.config.get_settings`.
- Produces: `class JsonPeClient` with `__init__(self, base_url: str, token: str, http: httpx.Client | None = None)` and methods:
  - `get_soat(self, placa: str) -> SoatInfo`
  - `get_vehiculo(self, placa: str) -> VehiculoInfo`
  - `get_licencia(self, dni: str) -> LicenciaInfo`
  Each raises `JsonPeError` on non-2xx or network failure. Module-level `class JsonPeError(Exception)`. Factory `get_jsonpe_client() -> JsonPeClient` builds from settings.

- [ ] **Step 1: Write fixtures**

`backend/tests/fixtures/jsonpe_soat.json`:
```json
{"placa": "ABC123", "aseguradora": "Rimac", "vigente": true, "fecha_fin": "2026-12-31"}
```
`backend/tests/fixtures/jsonpe_vehiculo.json`:
```json
{"placa": "ABC123", "marca": "TOYOTA", "modelo": "YARIS", "color": "PLATA", "anio": 2019}
```
`backend/tests/fixtures/jsonpe_licencia.json`:
```json
{"dni": "12345678", "nombres": "JUAN PEREZ", "categoria": "A-IIa", "vigente": true, "fecha_revalidacion": "2027-05-01"}
```

- [ ] **Step 2: Write the failing test**

`backend/tests/test_jsonpe_client.py`:
```python
import json
from pathlib import Path

import httpx
import pytest
import respx

from app.clients.jsonpe import JsonPeClient, JsonPeError

FIX = Path(__file__).parent / "fixtures"


def _load(name: str) -> dict:
    return json.loads((FIX / name).read_text())


@respx.mock
def test_get_soat_maps_fields():
    respx.get("https://json.pe/api/soat/ABC123").mock(
        return_value=httpx.Response(200, json=_load("jsonpe_soat.json"))
    )
    client = JsonPeClient(base_url="https://json.pe/api", token="t")
    soat = client.get_soat("ABC123")
    assert soat.vigente is True
    assert soat.aseguradora == "Rimac"
    assert soat.vence == "2026-12-31"
    assert soat.fuente == "json.pe"
    assert soat.consultado_en.endswith("Z")


@respx.mock
def test_get_vehiculo_maps_fields():
    respx.get("https://json.pe/api/vehiculo/ABC123").mock(
        return_value=httpx.Response(200, json=_load("jsonpe_vehiculo.json"))
    )
    client = JsonPeClient(base_url="https://json.pe/api", token="t")
    v = client.get_vehiculo("ABC123")
    assert v.marca == "TOYOTA"
    assert v.anio == 2019


@respx.mock
def test_get_licencia_maps_fields():
    respx.get("https://json.pe/api/licencia/12345678").mock(
        return_value=httpx.Response(200, json=_load("jsonpe_licencia.json"))
    )
    client = JsonPeClient(base_url="https://json.pe/api", token="t")
    lic = client.get_licencia("12345678")
    assert lic.categoria == "A-IIa"
    assert lic.nombre == "JUAN PEREZ"
    assert lic.vence == "2027-05-01"


@respx.mock
def test_sends_bearer_token():
    route = respx.get("https://json.pe/api/soat/ABC123").mock(
        return_value=httpx.Response(200, json=_load("jsonpe_soat.json"))
    )
    JsonPeClient(base_url="https://json.pe/api", token="secret").get_soat("ABC123")
    assert route.calls.last.request.headers["authorization"] == "Bearer secret"


@respx.mock
def test_raises_on_error_status():
    respx.get("https://json.pe/api/soat/ABC123").mock(
        return_value=httpx.Response(500, text="boom")
    )
    with pytest.raises(JsonPeError):
        JsonPeClient(base_url="https://json.pe/api", token="t").get_soat("ABC123")
```

- [ ] **Step 3: Run it — expect failure**

Run: `pytest tests/test_jsonpe_client.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.clients.jsonpe'`.

- [ ] **Step 4: Implement the client + adapter**

`backend/app/clients/jsonpe.py`:
```python
from __future__ import annotations

import httpx

from app.config import get_settings
from app.models import LicenciaInfo, SoatInfo, VehiculoInfo, now_iso

FUENTE = "json.pe"


class JsonPeError(Exception):
    pass


class JsonPeClient:
    def __init__(self, base_url: str, token: str, http: httpx.Client | None = None):
        self._base = base_url.rstrip("/")
        self._http = http or httpx.Client(
            headers={"Authorization": f"Bearer {token}"}, timeout=15.0
        )

    def _get(self, path: str) -> dict:
        try:
            resp = self._http.get(f"{self._base}{path}")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as exc:
            raise JsonPeError(str(exc)) from exc

    # --- adapters: the ONLY place that knows json.pe's field names ---
    def get_soat(self, placa: str) -> SoatInfo:
        d = self._get(f"/soat/{placa}")
        return SoatInfo(
            placa=placa,
            vigente=d.get("vigente"),
            aseguradora=d.get("aseguradora"),
            vence=d.get("fecha_fin"),
            fuente=FUENTE,
            consultado_en=now_iso(),
        )

    def get_vehiculo(self, placa: str) -> VehiculoInfo:
        d = self._get(f"/vehiculo/{placa}")
        return VehiculoInfo(
            placa=placa,
            marca=d.get("marca"),
            modelo=d.get("modelo"),
            color=d.get("color"),
            anio=d.get("anio"),
            fuente=FUENTE,
            consultado_en=now_iso(),
        )

    def get_licencia(self, dni: str) -> LicenciaInfo:
        d = self._get(f"/licencia/{dni}")
        return LicenciaInfo(
            dni=dni,
            nombre=d.get("nombres"),
            categoria=d.get("categoria"),
            vigente=d.get("vigente"),
            vence=d.get("fecha_revalidacion"),
            fuente=FUENTE,
            consultado_en=now_iso(),
        )


def get_jsonpe_client() -> JsonPeClient:
    s = get_settings()
    return JsonPeClient(base_url=s.jsonpe_base_url, token=s.jsonpe_token)
```

`backend/app/clients/__init__.py`: empty.

- [ ] **Step 5: Run it — expect pass**

Run: `pytest tests/test_jsonpe_client.py -v`
Expected: PASS (5 passed).

- [ ] **Step 6: Commit**

```bash
git add backend/app/clients/ backend/tests/test_jsonpe_client.py backend/tests/fixtures/jsonpe_*.json
git commit -m "feat(backend): json.pe client with isolated adapter layer"
```

---

### Task A3: Verify json.pe shapes against the live API

This is a real-data verification task. It corrects the A2 assumptions BEFORE downstream tasks trust them.

**Files:**
- Create: `backend/scripts/probe_jsonpe.py`
- Modify (only if mapping wrong): `backend/app/clients/jsonpe.py`, fixtures in `backend/tests/fixtures/jsonpe_*.json`

**Interfaces:**
- Consumes: `app.clients.jsonpe.get_jsonpe_client`.
- Produces: prints raw json.pe responses for a known plate/DNI so the adapter mapping and endpoint paths can be confirmed.

- [ ] **Step 1: Write the probe script**

`backend/scripts/probe_jsonpe.py`:
```python
"""Probe live json.pe to confirm endpoint paths and field names.

Usage: JSONPE_TOKEN=xxx python scripts/probe_jsonpe.py ABC123 12345678
"""
import json
import sys

import httpx

from app.config import get_settings


def main() -> None:
    placa = sys.argv[1] if len(sys.argv) > 1 else "ABC123"
    dni = sys.argv[2] if len(sys.argv) > 2 else "12345678"
    s = get_settings()
    http = httpx.Client(
        headers={"Authorization": f"Bearer {s.jsonpe_token}"}, timeout=20.0
    )
    for path in (f"/soat/{placa}", f"/vehiculo/{placa}", f"/licencia/{dni}"):
        print(f"\n=== GET {path} ===")
        try:
            r = http.get(f"{s.jsonpe_base_url.rstrip('/')}{path}")
            print("status:", r.status_code)
            print(json.dumps(r.json(), indent=2, ensure_ascii=False))
        except Exception as exc:  # noqa: BLE001 - probe script
            print("ERROR:", exc)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it against the live API**

Run: `JSONPE_TOKEN=<your-token> python scripts/probe_jsonpe.py <real-placa> <real-dni>`
Expected: three blocks of JSON. **Read them carefully.**

- [ ] **Step 3: Reconcile**

Compare live field names + endpoint paths to the assumptions in A2:
- If paths differ (e.g. `/v1/soat` or query-string style), update `_base`/path strings in `jsonpe.py`.
- If field names differ (e.g. `compania` not `aseguradora`, `año` not `anio`), update the `_adapt`/`get_*` mappings in `jsonpe.py` AND the matching `tests/fixtures/jsonpe_*.json` so tests reflect reality.
- If a datum (e.g. SOAT) is NOT available from json.pe, mark it for scraping fallback (Tasks A6/A7) and leave that field `None` from json.pe.

- [ ] **Step 4: Re-run the client tests**

Run: `pytest tests/test_jsonpe_client.py -v`
Expected: PASS (fixtures now mirror real shapes).

- [ ] **Step 5: Commit**

```bash
git add backend/scripts/probe_jsonpe.py backend/app/clients/jsonpe.py backend/tests/fixtures/jsonpe_*.json
git commit -m "chore(backend): verify json.pe shapes against live API and reconcile adapter"
```

---

### Task A4: Scoring (signals → verdict, worst-of)

**Files:**
- Create: `backend/app/services/__init__.py` (empty)
- Create: `backend/app/services/scoring.py`
- Test: `backend/tests/test_scoring.py`

**Interfaces:**
- Consumes: `app.models.{SoatInfo, VehiculoInfo, LicenciaInfo, Check, Veredicto, Color, now_iso}`.
- Produces:
  - `soat_check(soat: SoatInfo, hoy: date | None = None) -> Check` — 🔴 if `vigente is False`; 🟡 if `vigente is None` (desconocido) OR vence within 30 days; 🟢 if vigente and >30 days.
  - `vehiculo_check(v: VehiculoInfo) -> Check` — 🟢 if marca+modelo present; 🟡 if missing (no data to confirm the car).
  - `licencia_check(lic: LicenciaInfo) -> Check` — 🔴 if `vigente is False`; 🟡 if `None`; 🟢 if vigente.
  - `peor_color(colors: list[Color]) -> Color` — worst-of reducer (rojo > ambar > verde; "desconocido" treated as ambar).
  - `construir_veredicto(placa: str, checks: list[Check]) -> Veredicto` — sets `color = peor_color(...)`, `resumen` per color.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_scoring.py`:
```python
from datetime import date

from app.models import LicenciaInfo, SoatInfo, VehiculoInfo, now_iso
from app.services.scoring import (
    construir_veredicto,
    licencia_check,
    peor_color,
    soat_check,
    vehiculo_check,
)

HOY = date(2026, 6, 26)


def _soat(vigente, vence):
    return SoatInfo(placa="ABC123", vigente=vigente, aseguradora="Rimac",
                    vence=vence, fuente="json.pe", consultado_en=now_iso())


def test_soat_expired_is_red():
    assert soat_check(_soat(False, "2025-01-01"), HOY).color == "rojo"


def test_soat_unknown_is_amber():
    assert soat_check(_soat(None, None), HOY).color == "ambar"


def test_soat_expiring_soon_is_amber():
    assert soat_check(_soat(True, "2026-07-10"), HOY).color == "ambar"


def test_soat_valid_is_green():
    assert soat_check(_soat(True, "2026-12-31"), HOY).color == "verde"


def test_vehiculo_present_is_green():
    v = VehiculoInfo(placa="ABC123", marca="TOYOTA", modelo="YARIS",
                     color="PLATA", anio=2019, fuente="json.pe", consultado_en=now_iso())
    assert vehiculo_check(v).color == "verde"


def test_licencia_invalid_is_red():
    lic = LicenciaInfo(dni="1", vigente=False, fuente="json.pe", consultado_en=now_iso())
    assert licencia_check(lic).color == "rojo"


def test_peor_color_picks_worst():
    assert peor_color(["verde", "verde"]) == "verde"
    assert peor_color(["verde", "ambar"]) == "ambar"
    assert peor_color(["ambar", "rojo"]) == "rojo"
    assert peor_color(["verde", "desconocido"]) == "ambar"


def test_veredicto_is_worst_of_checks():
    v = SoatInfo(placa="ABC123", vigente=False, vence="2025-01-01",
                 fuente="json.pe", consultado_en=now_iso())
    veh = VehiculoInfo(placa="ABC123", marca="TOYOTA", modelo="YARIS",
                       color="PLATA", anio=2019, fuente="json.pe", consultado_en=now_iso())
    checks = [soat_check(v, HOY), vehiculo_check(veh)]
    veredicto = construir_veredicto("ABC123", checks)
    assert veredicto.color == "rojo"
    assert veredicto.placa == "ABC123"
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_scoring.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.services.scoring'`.

- [ ] **Step 3: Implement scoring**

`backend/app/services/scoring.py`:
```python
from __future__ import annotations

from datetime import date

from app.models import (
    Check,
    Color,
    LicenciaInfo,
    SoatInfo,
    Veredicto,
    VehiculoInfo,
    now_iso,
)

_RANK: dict[Color, int] = {"verde": 0, "desconocido": 1, "ambar": 1, "rojo": 2}
_DIAS_AVISO = 30


def _parse(d: str | None) -> date | None:
    try:
        return date.fromisoformat(d) if d else None
    except ValueError:
        return None


def peor_color(colors: list[Color]) -> Color:
    worst = max(colors, key=lambda c: _RANK[c]) if colors else "ambar"
    return "ambar" if worst == "desconocido" else worst


def soat_check(soat: SoatInfo, hoy: date | None = None) -> Check:
    hoy = hoy or date.today()
    vence = _parse(soat.vence)
    if soat.vigente is False:
        color: Color = "rojo"
        detalle = "SOAT vencido. No es seguro subir."
    elif soat.vigente is None:
        color = "ambar"
        detalle = "No pudimos confirmar el SOAT."
    elif vence and (vence - hoy).days <= _DIAS_AVISO:
        color = "ambar"
        detalle = f"SOAT vence pronto ({soat.vence})."
    else:
        color = "verde"
        detalle = f"SOAT vigente{f' hasta {soat.vence}' if soat.vence else ''}."
    return Check(clave="soat", etiqueta="SOAT", color=color, detalle=detalle,
                 fuente=soat.fuente, consultado_en=soat.consultado_en)


def vehiculo_check(v: VehiculoInfo) -> Check:
    if v.marca and v.modelo:
        partes = " ".join(p for p in [v.marca, v.modelo, v.color] if p)
        return Check(clave="vehiculo", etiqueta="Datos del vehículo", color="verde",
                     detalle=f"Registrado como {partes}.", fuente=v.fuente,
                     consultado_en=v.consultado_en)
    return Check(clave="vehiculo", etiqueta="Datos del vehículo", color="ambar",
                 detalle="No pudimos confirmar los datos del vehículo.",
                 fuente=v.fuente, consultado_en=v.consultado_en)


def licencia_check(lic: LicenciaInfo) -> Check:
    if lic.vigente is False:
        color: Color = "rojo"
        detalle = "Licencia no vigente."
    elif lic.vigente is None:
        color = "ambar"
        detalle = "No pudimos confirmar la licencia."
    else:
        color = "verde"
        detalle = f"Licencia {lic.categoria or ''} vigente.".strip()
    return Check(clave="licencia", etiqueta="Licencia de conducir", color=color,
                 detalle=detalle, fuente=lic.fuente, consultado_en=lic.consultado_en)


def construir_veredicto(placa: str, checks: list[Check]) -> Veredicto:
    color = peor_color([c.color for c in checks])
    resumen = {
        "verde": "Todo en orden. Puedes subir con tranquilidad.",
        "ambar": "Precaución: hay datos que no pudimos confirmar.",
        "rojo": "Riesgo: revisa las alertas antes de subir.",
    }[color]
    return Veredicto(color=color, resumen=resumen, checks=checks, placa=placa)
```

`backend/app/services/__init__.py`: empty.

- [ ] **Step 4: Run it — expect pass**

Run: `pytest tests/test_scoring.py -v`
Expected: PASS (8 passed).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/__init__.py backend/app/services/scoring.py backend/tests/test_scoring.py
git commit -m "feat(backend): worst-of scoring from data signals"
```

---

### Task A5: In-memory TTL cache

**Files:**
- Create: `backend/app/services/cache.py`
- Test: `backend/tests/test_cache.py`

**Interfaces:**
- Consumes: nothing.
- Produces: `class TTLCache` with `__init__(self, ttl_seconds: int, clock: Callable[[], float] = time.monotonic)`, `get(self, key: str) -> Any | None` (returns `None` if missing or expired), `set(self, key: str, value: Any) -> None`. The injectable `clock` makes expiry testable without sleeping.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_cache.py`:
```python
from app.services.cache import TTLCache


def test_get_returns_set_value():
    c = TTLCache(ttl_seconds=10, clock=lambda: 0.0)
    c.set("ABC123", {"x": 1})
    assert c.get("ABC123") == {"x": 1}


def test_missing_key_returns_none():
    assert TTLCache(ttl_seconds=10, clock=lambda: 0.0).get("nope") is None


def test_expired_entry_returns_none():
    t = {"now": 0.0}
    c = TTLCache(ttl_seconds=10, clock=lambda: t["now"])
    c.set("ABC123", 42)
    t["now"] = 11.0
    assert c.get("ABC123") is None
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_cache.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.services.cache'`.

- [ ] **Step 3: Implement cache**

`backend/app/services/cache.py`:
```python
from __future__ import annotations

import time
from typing import Any, Callable


class TTLCache:
    def __init__(self, ttl_seconds: int, clock: Callable[[], float] = time.monotonic):
        self._ttl = ttl_seconds
        self._clock = clock
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if self._clock() >= expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (self._clock() + self._ttl, value)
```

- [ ] **Step 4: Run it — expect pass**

Run: `pytest tests/test_cache.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/cache.py backend/tests/test_cache.py
git commit -m "feat(backend): in-memory TTL cache"
```

---

### Task A6: APESEG SOAT scraper (fallback)

Used only when json.pe does not return SOAT (decided in A3). Parsing is tested against a saved HTML fixture — the test never hits the network.

**Files:**
- Create: `backend/app/scrapers/__init__.py` (empty)
- Create: `backend/app/scrapers/apeseg.py`
- Create: `backend/tests/fixtures/apeseg_vigente.html`
- Test: `backend/tests/test_apeseg.py`

**Interfaces:**
- Consumes: `app.models.{SoatInfo, now_iso}`.
- Produces:
  - `parse_apeseg(html: str, placa: str) -> SoatInfo` — pure parser; `fuente="APESEG"`.
  - `fetch_soat(placa: str, http: httpx.Client | None = None) -> SoatInfo` — fetches then parses (network path, not unit-tested).

> Note: the real APESEG markup is unknown until you inspect the live page. The fixture below is a representative shape; when you wire `fetch_soat`, save the real HTML over this fixture and adjust the selectors in `parse_apeseg`. The test asserts on the fixture, so updating both together keeps it green.

- [ ] **Step 1: Write the fixture**

`backend/tests/fixtures/apeseg_vigente.html`:
```html
<html><body>
  <table id="resultado">
    <tr><td>Placa</td><td class="placa">ABC123</td></tr>
    <tr><td>Compañía</td><td class="aseguradora">RIMAC SEGUROS</td></tr>
    <tr><td>Estado</td><td class="estado">VIGENTE</td></tr>
    <tr><td>Fin de vigencia</td><td class="fin">2026-11-30</td></tr>
  </table>
</body></html>
```

- [ ] **Step 2: Write the failing test**

`backend/tests/test_apeseg.py`:
```python
from pathlib import Path

from app.scrapers.apeseg import parse_apeseg

FIX = Path(__file__).parent / "fixtures"


def test_parse_apeseg_vigente():
    html = (FIX / "apeseg_vigente.html").read_text()
    soat = parse_apeseg(html, "ABC123")
    assert soat.vigente is True
    assert soat.aseguradora == "RIMAC SEGUROS"
    assert soat.vence == "2026-11-30"
    assert soat.fuente == "APESEG"
```

- [ ] **Step 3: Run it — expect failure**

Run: `pytest tests/test_apeseg.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.scrapers.apeseg'`.

- [ ] **Step 4: Implement the scraper**

`backend/app/scrapers/apeseg.py`:
```python
from __future__ import annotations

import httpx
from bs4 import BeautifulSoup

from app.models import SoatInfo, now_iso

FUENTE = "APESEG"
URL = "https://www.apeseg.org.pe/consultas-soat/"


def _text(soup: BeautifulSoup, selector: str) -> str | None:
    el = soup.select_one(selector)
    return el.get_text(strip=True) if el else None


def parse_apeseg(html: str, placa: str) -> SoatInfo:
    soup = BeautifulSoup(html, "html.parser")
    estado = (_text(soup, ".estado") or "").upper()
    vigente = True if estado == "VIGENTE" else (False if estado else None)
    return SoatInfo(
        placa=placa,
        vigente=vigente,
        aseguradora=_text(soup, ".aseguradora"),
        vence=_text(soup, ".fin"),
        fuente=FUENTE,
        consultado_en=now_iso(),
    )


def fetch_soat(placa: str, http: httpx.Client | None = None) -> SoatInfo:
    http = http or httpx.Client(timeout=20.0)
    resp = http.get(URL, params={"placa": placa})
    resp.raise_for_status()
    return parse_apeseg(resp.text, placa)
```

`backend/app/scrapers/__init__.py`: empty.

- [ ] **Step 5: Run it — expect pass**

Run: `pytest tests/test_apeseg.py -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/scrapers/__init__.py backend/app/scrapers/apeseg.py backend/tests/test_apeseg.py backend/tests/fixtures/apeseg_vigente.html
git commit -m "feat(backend): APESEG SOAT scraper fallback with fixture test"
```

---

### Task A7: CITV (revisión técnica) scraper (fallback)

**Files:**
- Create: `backend/app/scrapers/citv.py`
- Create: `backend/tests/fixtures/citv_vigente.html`
- Test: `backend/tests/test_citv.py`

**Interfaces:**
- Consumes: `app.models.{Check, now_iso}`.
- Produces:
  - `parse_citv(html: str) -> Check` — `clave="revision_tecnica"`, `etiqueta="Revisión técnica"`; 🟢 if `VIGENTE`, 🔴 if `NO VIGENTE`, 🟡 otherwise; `fuente="MTC CITV"`.
  - `fetch_revision(placa: str, http: httpx.Client | None = None) -> Check`.

- [ ] **Step 1: Write the fixture**

`backend/tests/fixtures/citv_vigente.html`:
```html
<html><body>
  <div id="datos">
    <span class="estado">VIGENTE</span>
    <span class="vence">2026-09-15</span>
  </div>
</body></html>
```

- [ ] **Step 2: Write the failing test**

`backend/tests/test_citv.py`:
```python
from pathlib import Path

from app.scrapers.citv import parse_citv

FIX = Path(__file__).parent / "fixtures"


def test_parse_citv_vigente():
    html = (FIX / "citv_vigente.html").read_text()
    chk = parse_citv(html)
    assert chk.clave == "revision_tecnica"
    assert chk.color == "verde"
    assert "2026-09-15" in chk.detalle
    assert chk.fuente == "MTC CITV"
```

- [ ] **Step 3: Run it — expect failure**

Run: `pytest tests/test_citv.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.scrapers.citv'`.

- [ ] **Step 4: Implement**

`backend/app/scrapers/citv.py`:
```python
from __future__ import annotations

import httpx
from bs4 import BeautifulSoup

from app.models import Check, Color, now_iso

FUENTE = "MTC CITV"
URL = "https://rec.mtc.gob.pe/Citv/ArConsultaCitv"


def parse_citv(html: str) -> Check:
    soup = BeautifulSoup(html, "html.parser")
    estado_el = soup.select_one(".estado")
    vence_el = soup.select_one(".vence")
    estado = (estado_el.get_text(strip=True).upper() if estado_el else "")
    vence = vence_el.get_text(strip=True) if vence_el else None
    if estado == "VIGENTE":
        color: Color = "verde"
        detalle = f"Revisión técnica vigente{f' hasta {vence}' if vence else ''}."
    elif estado:
        color = "rojo"
        detalle = "Revisión técnica no vigente."
    else:
        color = "ambar"
        detalle = "No pudimos confirmar la revisión técnica."
    return Check(clave="revision_tecnica", etiqueta="Revisión técnica", color=color,
                 detalle=detalle, fuente=FUENTE, consultado_en=now_iso())


def fetch_revision(placa: str, http: httpx.Client | None = None) -> Check:
    http = http or httpx.Client(timeout=20.0)
    resp = http.get(URL, params={"placa": placa})
    resp.raise_for_status()
    return parse_citv(resp.text)
```

- [ ] **Step 5: Run it — expect pass**

Run: `pytest tests/test_citv.py -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/scrapers/citv.py backend/tests/test_citv.py backend/tests/fixtures/citv_vigente.html
git commit -m "feat(backend): MTC CITV revisión técnica scraper fallback"
```

---

### Task A8: Aggregator (orchestrates sources per módulo, with cache + graceful degradation)

**Files:**
- Create: `backend/app/services/aggregator.py`
- Test: `backend/tests/test_aggregator.py`

**Interfaces:**
- Consumes: `JsonPeClient`, `TTLCache`, scoring functions, scrapers, models.
- Produces:
  - `class Aggregator` with `__init__(self, jsonpe: JsonPeClient, cache: TTLCache, citv_fetch=fetch_revision)`.
  - `verificar_pasajero(self, placa: str) -> Veredicto` — gathers SOAT + vehículo via json.pe (each wrapped so one failing source becomes a 🟡 check, never a 500), adds CITV check, builds verdict, caches by `f"pasajero:{placa}"`.
  - On cached hit, returns the cached `Veredicto`.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_aggregator.py`:
```python
from app.models import SoatInfo, VehiculoInfo, Check, now_iso
from app.clients.jsonpe import JsonPeError
from app.services.aggregator import Aggregator
from app.services.cache import TTLCache


class FakeJsonPe:
    def __init__(self, soat=None, veh=None, soat_error=False):
        self._soat = soat
        self._veh = veh
        self._soat_error = soat_error
        self.soat_calls = 0

    def get_soat(self, placa):
        self.soat_calls += 1
        if self._soat_error:
            raise JsonPeError("down")
        return self._soat

    def get_vehiculo(self, placa):
        return self._veh


def _green_citv(placa):
    return Check(clave="revision_tecnica", etiqueta="Revisión técnica",
                 color="verde", detalle="ok", fuente="MTC CITV", consultado_en=now_iso())


def _soat(vigente):
    return SoatInfo(placa="ABC123", vigente=vigente, aseguradora="Rimac",
                    vence="2026-12-31", fuente="json.pe", consultado_en=now_iso())


def _veh():
    return VehiculoInfo(placa="ABC123", marca="TOYOTA", modelo="YARIS", color="PLATA",
                        anio=2019, fuente="json.pe", consultado_en=now_iso())


def test_all_green_yields_green_verdict():
    agg = Aggregator(FakeJsonPe(soat=_soat(True), veh=_veh()),
                     TTLCache(60, clock=lambda: 0.0), citv_fetch=_green_citv)
    v = agg.verificar_pasajero("ABC123")
    assert v.color == "verde"
    assert {c.clave for c in v.checks} == {"soat", "vehiculo", "revision_tecnica"}


def test_soat_source_failure_degrades_to_amber_not_500():
    agg = Aggregator(FakeJsonPe(soat_error=True, veh=_veh()),
                     TTLCache(60, clock=lambda: 0.0), citv_fetch=_green_citv)
    v = agg.verificar_pasajero("ABC123")
    soat_check = next(c for c in v.checks if c.clave == "soat")
    assert soat_check.color == "ambar"
    assert v.color == "ambar"


def test_second_call_is_cached():
    fake = FakeJsonPe(soat=_soat(True), veh=_veh())
    agg = Aggregator(fake, TTLCache(60, clock=lambda: 0.0), citv_fetch=_green_citv)
    agg.verificar_pasajero("ABC123")
    agg.verificar_pasajero("ABC123")
    assert fake.soat_calls == 1
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_aggregator.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.services.aggregator'`.

- [ ] **Step 3: Implement**

`backend/app/services/aggregator.py`:
```python
from __future__ import annotations

from typing import Callable

from app.clients.jsonpe import JsonPeError
from app.models import Check, SoatInfo, Veredicto, VehiculoInfo, now_iso
from app.scrapers.citv import fetch_revision
from app.services.cache import TTLCache
from app.services.scoring import (
    construir_veredicto,
    soat_check,
    vehiculo_check,
)


def _amber(clave: str, etiqueta: str, fuente: str) -> Check:
    return Check(clave=clave, etiqueta=etiqueta, color="ambar",
                 detalle="No pudimos consultar esta fuente.", fuente=fuente,
                 consultado_en=now_iso())


class Aggregator:
    def __init__(self, jsonpe, cache: TTLCache,
                 citv_fetch: Callable[[str], Check] = fetch_revision):
        self._jsonpe = jsonpe
        self._cache = cache
        self._citv_fetch = citv_fetch

    def verificar_pasajero(self, placa: str) -> Veredicto:
        key = f"pasajero:{placa}"
        cached = self._cache.get(key)
        if cached is not None:
            return cached

        checks: list[Check] = []
        try:
            checks.append(soat_check(self._jsonpe.get_soat(placa)))
        except JsonPeError:
            checks.append(_amber("soat", "SOAT", "json.pe"))
        try:
            checks.append(vehiculo_check(self._jsonpe.get_vehiculo(placa)))
        except JsonPeError:
            checks.append(_amber("vehiculo", "Datos del vehículo", "json.pe"))
        try:
            checks.append(self._citv_fetch(placa))
        except Exception:  # noqa: BLE001 - scraper failure must degrade, not crash
            checks.append(_amber("revision_tecnica", "Revisión técnica", "MTC CITV"))

        veredicto = construir_veredicto(placa, checks)
        self._cache.set(key, veredicto)
        return veredicto
```

- [ ] **Step 4: Run it — expect pass**

Run: `pytest tests/test_aggregator.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/aggregator.py backend/tests/test_aggregator.py
git commit -m "feat(backend): aggregator with graceful per-source degradation and caching"
```

---

### Task A9: Pasajero endpoint

**Files:**
- Create: `backend/app/routers/__init__.py` (empty)
- Create: `backend/app/routers/verificar.py`
- Modify: `backend/app/main.py` (mount router)
- Test: `backend/tests/test_verificar.py`

**Interfaces:**
- Consumes: `Aggregator`, `get_jsonpe_client`, `TTLCache`, `get_settings`, `Veredicto`.
- Produces:
  - `POST /verificar/pasajero` body `{"placa": "ABC123"}` → `Veredicto` JSON. Plate is normalized (uppercase, strip non-alphanumerics) before use. Empty/invalid plate → 422.
  - A FastAPI dependency `get_aggregator() -> Aggregator` (module-level cache instance) so tests can override it.

- [ ] **Step 1: Write the failing test**

`backend/tests/test_verificar.py`:
```python
from app.main import app
from app.models import Check, Veredicto, now_iso
from app.routers.verificar import get_aggregator


class StubAgg:
    def verificar_pasajero(self, placa):
        return Veredicto(
            color="rojo", resumen="Riesgo", placa=placa,
            checks=[Check(clave="soat", etiqueta="SOAT", color="rojo",
                          detalle="vencido", fuente="json.pe", consultado_en=now_iso())],
        )


def test_pasajero_returns_verdict(client):
    app.dependency_overrides[get_aggregator] = lambda: StubAgg()
    try:
        resp = client.post("/verificar/pasajero", json={"placa": "abc-123"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["color"] == "rojo"
        assert body["placa"] == "ABC123"  # normalized
    finally:
        app.dependency_overrides.clear()


def test_pasajero_rejects_empty_placa(client):
    resp = client.post("/verificar/pasajero", json={"placa": "  "})
    assert resp.status_code == 422
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_verificar.py -v`
Expected: FAIL — `ImportError`/`ModuleNotFoundError` for `app.routers.verificar`.

- [ ] **Step 3: Implement router + mount**

`backend/app/routers/verificar.py`:
```python
from __future__ import annotations

import re

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator

from app.clients.jsonpe import get_jsonpe_client
from app.config import get_settings
from app.models import Veredicto
from app.services.aggregator import Aggregator
from app.services.cache import TTLCache

router = APIRouter(prefix="/verificar", tags=["verificar"])

_cache = TTLCache(ttl_seconds=get_settings().cache_ttl_seconds)


def get_aggregator() -> Aggregator:
    return Aggregator(get_jsonpe_client(), _cache)


def _normalizar_placa(raw: str) -> str:
    return re.sub(r"[^A-Za-z0-9]", "", raw).upper()


class PasajeroRequest(BaseModel):
    placa: str

    @field_validator("placa")
    @classmethod
    def _no_vacia(cls, v: str) -> str:
        norm = _normalizar_placa(v)
        if not norm:
            raise ValueError("placa requerida")
        return norm


@router.post("/pasajero", response_model=Veredicto)
def verificar_pasajero(
    req: PasajeroRequest, agg: Aggregator = Depends(get_aggregator)
) -> Veredicto:
    return agg.verificar_pasajero(req.placa)
```

`backend/app/routers/__init__.py`: empty.

In `backend/app/main.py`, add after `app.add_middleware(...)`:
```python
from app.routers import verificar  # noqa: E402

app.include_router(verificar.router)
```

- [ ] **Step 4: Run it — expect pass**

Run: `pytest tests/test_verificar.py -v`
Expected: PASS (2 passed).

- [ ] **Step 5: Run the full backend suite + smoke-boot the server**

Run: `pytest -v`
Expected: all pass.
Run: `uvicorn app.main:app --port 8000 &` then `curl -s localhost:8000/health` → `{"status":"ok"}`; then `kill %1`.

- [ ] **Step 6: Commit**

```bash
git add backend/app/routers/ backend/app/main.py backend/tests/test_verificar.py
git commit -m "feat(backend): POST /verificar/pasajero endpoint"
```

---

### Task A10: Signed report + verified-driver QR + conductor endpoints

**Files:**
- Create: `backend/app/services/report.py`
- Create: `backend/app/services/qr.py`
- Create: `backend/app/routers/conductor.py`
- Modify: `backend/app/main.py` (mount conductor router)
- Test: `backend/tests/test_report.py`, `backend/tests/test_qr.py`, `backend/tests/test_conductor.py`

**Interfaces:**
- Consumes: `Veredicto`, `Aggregator`, `get_settings`, `now_iso`.
- Produces:
  - `report.firmar(veredicto: Veredicto, secret: str) -> dict` — returns `{"reporte": <veredicto dict>, "integridad": <sha256 hex>}` where the hash is `sha256(secret + canonical_json(veredicto))`.
  - `report.ReportStore` — in-memory `dict[str, str]` mapping `report_id -> placa`; `crear(placa) -> str` returns a short id; `placa_de(report_id) -> str | None`.
  - `qr.generar_png(data: str) -> bytes` — PNG bytes of a QR encoding `data`.
  - `POST /conductor/qr` body `{"placa": "...", "dni": "..."}` → `{"report_id","qr_url"}` where `qr_url = "/conductor/verify/{report_id}"`.
  - `GET /conductor/verify/{report_id}` → re-runs `verificar_pasajero(placa)` live (never cached stale data older than TTL) and returns the `Veredicto` — proving "QR re-consulta en tiempo real".
  - `GET /conductor/qr.png?report_id=...` → `image/png` of the QR.

- [ ] **Step 1: Write the report test**

`backend/tests/test_report.py`:
```python
from app.models import Veredicto
from app.services.report import ReportStore, firmar


def _v():
    return Veredicto(color="verde", resumen="ok", checks=[], placa="ABC123")


def test_firmar_is_deterministic_and_changes_with_secret():
    a = firmar(_v(), "s1")["integridad"]
    b = firmar(_v(), "s1")["integridad"]
    c = firmar(_v(), "s2")["integridad"]
    assert a == b
    assert a != c
    assert len(a) == 64  # sha256 hex


def test_report_store_roundtrip():
    store = ReportStore()
    rid = store.crear("ABC123")
    assert store.placa_de(rid) == "ABC123"
    assert store.placa_de("missing") is None
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_report.py -v`
Expected: FAIL — no module `app.services.report`.

- [ ] **Step 3: Implement report**

`backend/app/services/report.py`:
```python
from __future__ import annotations

import hashlib
import secrets

from app.models import Veredicto


def firmar(veredicto: Veredicto, secret: str) -> dict:
    canonical = veredicto.model_dump_json()
    h = hashlib.sha256((secret + canonical).encode("utf-8")).hexdigest()
    return {"reporte": veredicto.model_dump(), "integridad": h}


class ReportStore:
    def __init__(self) -> None:
        self._map: dict[str, str] = {}

    def crear(self, placa: str) -> str:
        rid = secrets.token_urlsafe(8)
        self._map[rid] = placa
        return rid

    def placa_de(self, report_id: str) -> str | None:
        return self._map.get(report_id)
```

- [ ] **Step 4: Run report test — expect pass**

Run: `pytest tests/test_report.py -v`
Expected: PASS.

- [ ] **Step 5: Write the QR test**

`backend/tests/test_qr.py`:
```python
from app.services.qr import generar_png


def test_generar_png_returns_png_bytes():
    data = generar_png("/conductor/verify/abc")
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    assert len(data) > 100
```

- [ ] **Step 6: Run it — expect failure**

Run: `pytest tests/test_qr.py -v`
Expected: FAIL — no module `app.services.qr`.

- [ ] **Step 7: Implement QR**

`backend/app/services/qr.py`:
```python
from __future__ import annotations

import io

import qrcode


def generar_png(data: str) -> bytes:
    img = qrcode.make(data)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
```

- [ ] **Step 8: Run QR test — expect pass**

Run: `pytest tests/test_qr.py -v`
Expected: PASS.

- [ ] **Step 9: Write the conductor endpoint test**

`backend/tests/test_conductor.py`:
```python
from app.main import app
from app.models import Check, Veredicto, now_iso
from app.routers.verificar import get_aggregator


class StubAgg:
    def verificar_pasajero(self, placa):
        return Veredicto(color="verde", resumen="ok", placa=placa,
                         checks=[Check(clave="soat", etiqueta="SOAT", color="verde",
                                       detalle="ok", fuente="json.pe",
                                       consultado_en=now_iso())])


def test_qr_then_verify_roundtrip(client):
    app.dependency_overrides[get_aggregator] = lambda: StubAgg()
    try:
        r = client.post("/conductor/qr", json={"placa": "ABC123", "dni": "12345678"})
        assert r.status_code == 200
        rid = r.json()["report_id"]
        assert r.json()["qr_url"] == f"/conductor/verify/{rid}"

        v = client.get(f"/conductor/verify/{rid}")
        assert v.status_code == 200
        assert v.json()["placa"] == "ABC123"
        assert v.json()["color"] == "verde"

        png = client.get("/conductor/qr.png", params={"report_id": rid})
        assert png.status_code == 200
        assert png.headers["content-type"] == "image/png"
    finally:
        app.dependency_overrides.clear()


def test_verify_unknown_id_404(client):
    assert client.get("/conductor/verify/nope").status_code == 404
```

- [ ] **Step 10: Run it — expect failure**

Run: `pytest tests/test_conductor.py -v`
Expected: FAIL — no module `app.routers.conductor`.

- [ ] **Step 11: Implement conductor router + mount**

`backend/app/routers/conductor.py`:
```python
from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from app.models import Veredicto
from app.routers.verificar import get_aggregator
from app.services.aggregator import Aggregator
from app.services.qr import generar_png
from app.services.report import ReportStore

router = APIRouter(prefix="/conductor", tags=["conductor"])
_store = ReportStore()


def _norm(raw: str) -> str:
    return re.sub(r"[^A-Za-z0-9]", "", raw).upper()


class QrRequest(BaseModel):
    placa: str
    dni: str


@router.post("/qr")
def crear_qr(req: QrRequest) -> dict:
    placa = _norm(req.placa)
    if not placa:
        raise HTTPException(status_code=422, detail="placa requerida")
    rid = _store.crear(placa)
    return {"report_id": rid, "qr_url": f"/conductor/verify/{rid}"}


@router.get("/verify/{report_id}", response_model=Veredicto)
def verificar_qr(
    report_id: str, agg: Aggregator = Depends(get_aggregator)
) -> Veredicto:
    placa = _store.placa_de(report_id)
    if placa is None:
        raise HTTPException(status_code=404, detail="reporte no encontrado")
    return agg.verificar_pasajero(placa)


@router.get("/qr.png")
def qr_png(report_id: str) -> Response:
    if _store.placa_de(report_id) is None:
        raise HTTPException(status_code=404, detail="reporte no encontrado")
    png = generar_png(f"/conductor/verify/{report_id}")
    return Response(content=png, media_type="image/png")
```

In `backend/app/main.py`, add:
```python
from app.routers import conductor  # noqa: E402

app.include_router(conductor.router)
```

- [ ] **Step 12: Run all three new test files — expect pass**

Run: `pytest tests/test_report.py tests/test_qr.py tests/test_conductor.py -v`
Expected: all PASS.

- [ ] **Step 13: Commit**

```bash
git add backend/app/services/report.py backend/app/services/qr.py backend/app/routers/conductor.py backend/app/main.py backend/tests/test_report.py backend/tests/test_qr.py backend/tests/test_conductor.py
git commit -m "feat(backend): signed reports, QR generation, verified-driver endpoints"
```

---

### Task A11: OCR endpoint (read plate from photo)

EasyOCR is heavy; it's an optional extra. The endpoint accepts an uploaded image and returns candidate plate strings. The plate-cleaning logic is pure and unit-tested without loading the model.

**Files:**
- Create: `backend/app/services/ocr.py`
- Create: `backend/app/routers/ocr.py`
- Modify: `backend/app/main.py` (mount)
- Test: `backend/tests/test_ocr.py`

**Interfaces:**
- Consumes: nothing heavy in the unit-tested path.
- Produces:
  - `ocr.limpiar_placa(texto: str) -> str | None` — uppercases, strips non-alphanumerics, returns the token if it matches Peru plate patterns (`^[A-Z]{3}[0-9]{3}$` or `^[A-Z][0-9][A-Z][0-9]{3}$` or `^[A-Z]{2}[0-9]{4}$`), else `None`.
  - `ocr.leer_placa(image_bytes: bytes) -> list[str]` — runs EasyOCR (lazy-imported, lazy-initialized reader), returns cleaned plate candidates. Not unit-tested (needs model).
  - `POST /ocr/placa` (multipart file `imagen`) → `{"candidatas": ["ABC123", ...]}`.

- [ ] **Step 1: Write the failing test (pure logic only)**

`backend/tests/test_ocr.py`:
```python
from app.services.ocr import limpiar_placa


def test_limpiar_placa_standard():
    assert limpiar_placa("abc-123") == "ABC123"


def test_limpiar_placa_with_noise():
    assert limpiar_placa("  A1B-234 ") == "A1B234"


def test_limpiar_placa_rejects_garbage():
    assert limpiar_placa("hello") is None
    assert limpiar_placa("12") is None
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_ocr.py -v`
Expected: FAIL — no module `app.services.ocr`.

- [ ] **Step 3: Implement OCR service**

`backend/app/services/ocr.py`:
```python
from __future__ import annotations

import re

_PATRONES = [
    re.compile(r"^[A-Z]{3}[0-9]{3}$"),
    re.compile(r"^[A-Z][0-9][A-Z][0-9]{3}$"),
    re.compile(r"^[A-Z]{2}[0-9]{4}$"),
]
_reader = None


def limpiar_placa(texto: str) -> str | None:
    norm = re.sub(r"[^A-Za-z0-9]", "", texto).upper()
    return norm if any(p.match(norm) for p in _PATRONES) else None


def _get_reader():
    global _reader
    if _reader is None:
        import easyocr  # lazy: only when an image is actually processed

        _reader = easyocr.Reader(["es"], gpu=False)
    return _reader


def leer_placa(image_bytes: bytes) -> list[str]:
    import numpy as np
    from PIL import Image
    import io

    img = np.array(Image.open(io.BytesIO(image_bytes)).convert("RGB"))
    resultados = _get_reader().readtext(img, detail=0)
    candidatas = []
    for texto in resultados:
        placa = limpiar_placa(texto)
        if placa and placa not in candidatas:
            candidatas.append(placa)
    return candidatas
```

- [ ] **Step 4: Run pure-logic test — expect pass**

Run: `pytest tests/test_ocr.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Implement the OCR router + mount**

`backend/app/routers/ocr.py`:
```python
from __future__ import annotations

from fastapi import APIRouter, UploadFile

from app.services.ocr import leer_placa

router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.post("/placa")
async def ocr_placa(imagen: UploadFile) -> dict:
    data = await imagen.read()
    return {"candidatas": leer_placa(data)}
```

In `backend/app/main.py`, add:
```python
from app.routers import ocr  # noqa: E402

app.include_router(ocr.router)
```

- [ ] **Step 6: Install OCR extra and smoke-test (manual, optional)**

Run: `pip install -e ".[ocr]"`
Run (with any plate photo `plate.jpg`): `curl -s -F "imagen=@plate.jpg" localhost:8000/ocr/placa`
Expected: `{"candidatas": [...]}` (may be empty for a poor photo — that's acceptable).

- [ ] **Step 7: Commit**

```bash
git add backend/app/services/ocr.py backend/app/routers/ocr.py backend/app/main.py backend/tests/test_ocr.py
git commit -m "feat(backend): OCR plate endpoint with pure plate-cleaning logic"
```

---

### Task A12: Comprador module — DNI + contract analysis (Claude)

Extends verification for the buyer: vehicle + SOAT (reuse pasajero), plus optional contract-clause analysis via Claude. SUNARP gravámenes (Playwright) is documented but gated as optional Phase-3 (see note) to keep this task testable.

**Files:**
- Create: `backend/app/services/contract.py`
- Modify: `backend/app/routers/verificar.py` (add `/verificar/comprador`)
- Test: `backend/tests/test_contract.py`, extend `backend/tests/test_verificar.py`

**Interfaces:**
- Consumes: `Aggregator`, `anthropic` SDK, `get_settings`.
- Produces:
  - `contract.analizar(texto: str, client=None) -> dict` — calls Claude `claude-sonnet-4-6`, returns `{"alertas": list[str], "resumen": str}`. `client` injectable for tests (a stub with `.messages.create`).
  - `contract.HALLAZGO_SCHEMA` — the JSON shape requested from Claude.
  - `POST /verificar/comprador` multipart: `placa` (form field) + optional `contrato` (file, PDF/text) → `{"veredicto": Veredicto, "contrato": {"alertas","resumen"} | null}`.

- [ ] **Step 1: Write the contract test (stubbed Claude)**

`backend/tests/test_contract.py`:
```python
import json

from app.services.contract import analizar


class FakeMessage:
    def __init__(self, text):
        self.content = [type("Block", (), {"text": text})()]


class FakeMessages:
    def __init__(self, payload):
        self._payload = payload

    def create(self, **kwargs):
        return FakeMessage(json.dumps(self._payload))


class FakeClient:
    def __init__(self, payload):
        self.messages = FakeMessages(payload)


def test_analizar_parses_claude_json():
    fake = FakeClient({"alertas": ["Precio muy bajo"], "resumen": "Revisar precio"})
    out = analizar("contrato de compraventa ...", client=fake)
    assert out["alertas"] == ["Precio muy bajo"]
    assert out["resumen"] == "Revisar precio"
```

- [ ] **Step 2: Run it — expect failure**

Run: `pytest tests/test_contract.py -v`
Expected: FAIL — no module `app.services.contract`.

- [ ] **Step 3: Implement contract analysis**

`backend/app/services/contract.py`:
```python
from __future__ import annotations

import json

from app.config import get_settings

MODELO = "claude-sonnet-4-6"

HALLAZGO_SCHEMA = '{"alertas": [string], "resumen": string}'

_PROMPT = (
    "Eres un asesor legal peruano. Analiza este contrato de compraventa "
    "vehicular y devuelve SOLO JSON con la forma "
    + HALLAZGO_SCHEMA
    + ". 'alertas' lista cláusulas riesgosas en lenguaje simple; "
    "'resumen' es una frase. Contrato:\n\n"
)


def _default_client():
    import anthropic

    return anthropic.Anthropic(api_key=get_settings().anthropic_api_key)


def analizar(texto: str, client=None) -> dict:
    client = client or _default_client()
    msg = client.messages.create(
        model=MODELO,
        max_tokens=1024,
        messages=[{"role": "user", "content": _PROMPT + texto[:12000]}],
    )
    raw = msg.content[0].text
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"alertas": [], "resumen": "No se pudo analizar el contrato."}
    return {"alertas": list(data.get("alertas", [])),
            "resumen": str(data.get("resumen", ""))}
```

- [ ] **Step 4: Run contract test — expect pass**

Run: `pytest tests/test_contract.py -v`
Expected: PASS.

- [ ] **Step 5: Write the comprador endpoint test**

Append to `backend/tests/test_verificar.py`:
```python
def test_comprador_returns_veredicto_without_contract(client):
    from app.routers.verificar import get_aggregator
    app.dependency_overrides[get_aggregator] = lambda: StubAgg()
    try:
        resp = client.post("/verificar/comprador", data={"placa": "ABC123"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["veredicto"]["placa"] == "ABC123"
        assert body["contrato"] is None
    finally:
        app.dependency_overrides.clear()
```

- [ ] **Step 6: Run it — expect failure**

Run: `pytest tests/test_verificar.py::test_comprador_returns_veredicto_without_contract -v`
Expected: FAIL — 404 (route not defined yet).

- [ ] **Step 7: Add the comprador route**

Append to `backend/app/routers/verificar.py`:
```python
from fastapi import File, Form, UploadFile  # add to existing imports

from app.services.contract import analizar  # add to existing imports


@router.post("/comprador")
async def verificar_comprador(
    placa: str = Form(...),
    contrato: UploadFile | None = File(default=None),
    agg: Aggregator = Depends(get_aggregator),
) -> dict:
    norm = _normalizar_placa(placa)
    veredicto = agg.verificar_pasajero(norm)
    contrato_out = None
    if contrato is not None:
        texto = (await contrato.read()).decode("utf-8", errors="ignore")
        if texto.strip():
            contrato_out = analizar(texto)
    return {"veredicto": veredicto.model_dump(), "contrato": contrato_out}
```

- [ ] **Step 8: Run comprador test — expect pass**

Run: `pytest tests/test_verificar.py -v`
Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/app/services/contract.py backend/app/routers/verificar.py backend/tests/test_contract.py backend/tests/test_verificar.py
git commit -m "feat(backend): comprador endpoint with Claude contract analysis"
```

> **Phase-3 note (not in this plan's TDD scope):** SUNARP gravámenes and Alerta Robo require Playwright against a JS portal with no stable fixture and likely CAPTCHA. Add as a separate plan once the live portal is inspected; until then `verificar_comprador` reuses the pasajero signal set. Anti-clonación vision (YOLOv8/CLIP color match vs `VehiculoInfo.color`) is likewise deferred to its own plan — it needs a model, a labeled threshold, and the live image pipeline.

---

### Task A13: Full backend suite + run config

**Files:**
- Modify: `backend/.env.example` (already created; confirm complete)
- Create: `backend/README.md`

**Interfaces:**
- Consumes: everything.
- Produces: a documented run path.

- [ ] **Step 1: Run the entire backend suite**

Run: `pytest -v`
Expected: every test passes (models, jsonpe, scoring, cache, apeseg, citv, aggregator, verificar, report, qr, conductor, ocr, contract).

- [ ] **Step 2: Write backend README**

`backend/README.md`:
```markdown
# SubeSeguro Backend

## Run
```
python3.11 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev,ocr]"
cp .env.example .env   # fill JSONPE_TOKEN, ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

## Endpoints
- `GET /health`
- `POST /verificar/pasajero` `{"placa":"ABC123"}` → Veredicto
- `POST /verificar/comprador` (form `placa`, optional file `contrato`) → {veredicto, contrato}
- `POST /conductor/qr` `{"placa","dni"}` → {report_id, qr_url}
- `GET /conductor/verify/{id}` → live Veredicto
- `GET /conductor/qr.png?report_id=...` → PNG
- `POST /ocr/placa` (form file `imagen`) → {candidatas}

## Tests
`pytest -v` (no network — json.pe mocked, scrapers use fixtures)
```

- [ ] **Step 3: Commit**

```bash
git add backend/README.md backend/.env.example
git commit -m "docs(backend): run instructions and endpoint reference"
```

---

# Part B — Mobile App (Expo / React Native)

All paths in Part B are relative to `mobile/`. The app talks to the backend's HTTP contract from Part A. Set `EXPO_PUBLIC_API_URL` to the backend base URL.

## File Structure (Part B)

```
mobile/
├── package.json
├── app.json                       # Expo config
├── tsconfig.json
├── jest.config.js
├── babel.config.js
├── .env.example                   # EXPO_PUBLIC_API_URL
├── app/                           # expo-router screens
│   ├── _layout.tsx                # tab navigator
│   ├── index.tsx                  # Pasajero (home)
│   ├── comprador.tsx
│   └── conductor.tsx
├── src/
│   ├── api/
│   │   ├── client.ts              # axios instance
│   │   └── verificar.ts           # typed calls + Veredicto type
│   ├── components/
│   │   ├── Semaforo.tsx           # color verdict banner
│   │   ├── CheckList.tsx          # per-check detail rows
│   │   └── CompartirViaje.tsx     # WhatsApp share button
│   └── lib/
│       ├── colores.ts             # color -> hex/emoji/label map
│       └── whatsapp.ts            # build wa.me share url
└── __tests__/
    ├── verificar.test.ts
    ├── colores.test.ts
    ├── whatsapp.test.ts
    ├── Semaforo.test.tsx
    └── CompartirViaje.test.tsx
```

---

### Task B0: Expo scaffold + test harness

**Files:**
- Create: `mobile/` via `create-expo-app`
- Create: `mobile/jest.config.js`
- Modify: `mobile/package.json` (test script + deps)
- Create: `mobile/.env.example`
- Test: `mobile/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a runnable Expo + TypeScript project with `npm test` wired to jest + `@testing-library/react-native`.

- [ ] **Step 1: Scaffold the app**

Run from repo root:
```bash
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
npx expo install expo-router expo-camera expo-image-picker expo-barcode-scanner expo-linking
npm install axios
npm install -D jest jest-expo @testing-library/react-native @types/jest react-test-renderer
```

- [ ] **Step 2: Configure jest**

`mobile/jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|axios))',
  ],
};
```

In `mobile/package.json` `"scripts"`, add: `"test": "jest"`.

`mobile/.env.example`:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 3: Write the smoke test**

`mobile/__tests__/smoke.test.ts`:
```typescript
test('jest runs', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 4: Run it — expect pass**

Run: `npm test -- smoke`
Expected: `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): scaffold Expo TypeScript app with jest harness"
```

---

### Task B1: Color mapping + WhatsApp link builder (pure logic)

**Files:**
- Create: `mobile/src/lib/colores.ts`
- Create: `mobile/src/lib/whatsapp.ts`
- Test: `mobile/__tests__/colores.test.ts`, `mobile/__tests__/whatsapp.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `colores.ts`: `type Color = 'verde'|'ambar'|'rojo'|'desconocido'`; `estilo(c: Color): { hex: string; emoji: string; etiqueta: string }`.
  - `whatsapp.ts`: `construirMensaje(p: { placa: string; descripcion: string; hora: string }): string`; `urlWhatsapp(mensaje: string): string` → `https://wa.me/?text=<encoded>`.

- [ ] **Step 1: Write the failing tests**

`mobile/__tests__/colores.test.ts`:
```typescript
import { estilo } from '../src/lib/colores';

test('verde maps to green style', () => {
  expect(estilo('verde').emoji).toBe('🟢');
  expect(estilo('verde').etiqueta).toBe('Seguro');
});

test('rojo maps to red style', () => {
  expect(estilo('rojo').emoji).toBe('🔴');
  expect(estilo('rojo').hex).toBe('#E53935');
});

test('desconocido falls back to amber', () => {
  expect(estilo('desconocido').emoji).toBe('🟡');
});
```

`mobile/__tests__/whatsapp.test.ts`:
```typescript
import { construirMensaje, urlWhatsapp } from '../src/lib/whatsapp';

test('mensaje includes placa, descripcion, hora', () => {
  const m = construirMensaje({ placa: 'ABC123', descripcion: 'Toyota Yaris plata', hora: '14:30' });
  expect(m).toContain('ABC123');
  expect(m).toContain('Toyota Yaris plata');
  expect(m).toContain('14:30');
});

test('url encodes the message into wa.me', () => {
  const url = urlWhatsapp('hola mundo');
  expect(url).toBe('https://wa.me/?text=hola%20mundo');
});
```

- [ ] **Step 2: Run them — expect failure**

Run: `npm test -- colores whatsapp`
Expected: FAIL — cannot find modules.

- [ ] **Step 3: Implement**

`mobile/src/lib/colores.ts`:
```typescript
export type Color = 'verde' | 'ambar' | 'rojo' | 'desconocido';

const MAPA: Record<Color, { hex: string; emoji: string; etiqueta: string }> = {
  verde: { hex: '#43A047', emoji: '🟢', etiqueta: 'Seguro' },
  ambar: { hex: '#FB8C00', emoji: '🟡', etiqueta: 'Precaución' },
  rojo: { hex: '#E53935', emoji: '🔴', etiqueta: 'Riesgo' },
  desconocido: { hex: '#FB8C00', emoji: '🟡', etiqueta: 'Precaución' },
};

export function estilo(c: Color) {
  return MAPA[c] ?? MAPA.desconocido;
}
```

`mobile/src/lib/whatsapp.ts`:
```typescript
export function construirMensaje(p: {
  placa: string;
  descripcion: string;
  hora: string;
}): string {
  return (
    `🚗 Estoy tomando este vehículo:\n` +
    `Placa: ${p.placa}\n` +
    `Vehículo: ${p.descripcion}\n` +
    `Hora: ${p.hora}\n` +
    `(Enviado con SubeSeguro)`
  );
}

export function urlWhatsapp(mensaje: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
}
```

- [ ] **Step 4: Run them — expect pass**

Run: `npm test -- colores whatsapp`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/lib/ mobile/__tests__/colores.test.ts mobile/__tests__/whatsapp.test.ts
git commit -m "feat(mobile): color mapping and WhatsApp link builder"
```

---

### Task B2: Typed API client

**Files:**
- Create: `mobile/src/api/client.ts`
- Create: `mobile/src/api/verificar.ts`
- Test: `mobile/__tests__/verificar.test.ts`

**Interfaces:**
- Consumes: `axios`, backend contract from Part A.
- Produces:
  - `client.ts`: `export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL })`.
  - `verificar.ts`: types `Check`, `Veredicto` (mirroring `app.models`), and:
    - `verificarPasajero(placa: string): Promise<Veredicto>` → POST `/verificar/pasajero`.
    - `crearQrConductor(placa: string, dni: string): Promise<{ report_id: string; qr_url: string }>`.

- [ ] **Step 1: Write the failing test (mock axios)**

`mobile/__tests__/verificar.test.ts`:
```typescript
import { api } from '../src/api/client';
import { verificarPasajero } from '../src/api/verificar';

jest.mock('../src/api/client', () => ({
  api: { post: jest.fn() },
}));

test('verificarPasajero posts placa and returns veredicto', async () => {
  (api.post as jest.Mock).mockResolvedValue({
    data: { color: 'rojo', resumen: 'Riesgo', placa: 'ABC123', checks: [] },
  });
  const v = await verificarPasajero('ABC123');
  expect(api.post).toHaveBeenCalledWith('/verificar/pasajero', { placa: 'ABC123' });
  expect(v.color).toBe('rojo');
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npm test -- verificar`
Expected: FAIL — cannot find modules.

- [ ] **Step 3: Implement**

`mobile/src/api/client.ts`:
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
  timeout: 20000,
});
```

`mobile/src/api/verificar.ts`:
```typescript
import { api } from './client';
import type { Color } from '../lib/colores';

export interface Check {
  clave: string;
  etiqueta: string;
  color: Color;
  detalle: string;
  fuente: string;
  consultado_en: string;
}

export interface Veredicto {
  color: Color;
  resumen: string;
  placa: string;
  checks: Check[];
}

export async function verificarPasajero(placa: string): Promise<Veredicto> {
  const { data } = await api.post('/verificar/pasajero', { placa });
  return data as Veredicto;
}

export async function crearQrConductor(
  placa: string,
  dni: string,
): Promise<{ report_id: string; qr_url: string }> {
  const { data } = await api.post('/conductor/qr', { placa, dni });
  return data;
}
```

- [ ] **Step 4: Run it — expect pass**

Run: `npm test -- verificar`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/api/ mobile/__tests__/verificar.test.ts
git commit -m "feat(mobile): typed API client for verificar + conductor"
```

---

### Task B3: Semáforo + CheckList components

**Files:**
- Create: `mobile/src/components/Semaforo.tsx`
- Create: `mobile/src/components/CheckList.tsx`
- Test: `mobile/__tests__/Semaforo.test.tsx`

**Interfaces:**
- Consumes: `colores.estilo`, `Veredicto`/`Check` types.
- Produces:
  - `Semaforo({ veredicto }: { veredicto: Veredicto })` — banner showing emoji + etiqueta + `resumen`, background `estilo(color).hex`. `testID="semaforo"`, and `accessibilityLabel` = `"Veredicto: <etiqueta>"`.
  - `CheckList({ checks }: { checks: Check[] })` — one row per check: `etiqueta`, `detalle`, `fuente`. Each row `testID={"check-" + clave}`.

- [ ] **Step 1: Write the failing test**

`mobile/__tests__/Semaforo.test.tsx`:
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Semaforo } from '../src/components/Semaforo';

test('renders verdict label and resumen', () => {
  const { getByText, getByTestId } = render(
    <Semaforo
      veredicto={{ color: 'rojo', resumen: 'Riesgo: SOAT vencido', placa: 'ABC123', checks: [] }}
    />,
  );
  expect(getByTestId('semaforo')).toBeTruthy();
  expect(getByText(/Riesgo: SOAT vencido/)).toBeTruthy();
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npm test -- Semaforo`
Expected: FAIL — cannot find module `Semaforo`.

- [ ] **Step 3: Implement components**

`mobile/src/components/Semaforo.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { estilo } from '../lib/colores';
import type { Veredicto } from '../api/verificar';

export function Semaforo({ veredicto }: { veredicto: Veredicto }) {
  const s = estilo(veredicto.color);
  return (
    <View
      testID="semaforo"
      accessibilityLabel={`Veredicto: ${s.etiqueta}`}
      style={[styles.box, { backgroundColor: s.hex }]}
    >
      <Text style={styles.emoji}>{s.emoji}</Text>
      <Text style={styles.etiqueta}>{s.etiqueta}</Text>
      <Text style={styles.resumen}>{veredicto.resumen}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 24, borderRadius: 16, alignItems: 'center' },
  emoji: { fontSize: 48 },
  etiqueta: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 8 },
  resumen: { fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 4 },
});
```

`mobile/src/components/CheckList.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { estilo } from '../lib/colores';
import type { Check } from '../api/verificar';

export function CheckList({ checks }: { checks: Check[] }) {
  return (
    <View>
      {checks.map((c) => (
        <View key={c.clave} testID={`check-${c.clave}`} style={styles.row}>
          <Text style={styles.dot}>{estilo(c.color).emoji}</Text>
          <View style={styles.body}>
            <Text style={styles.etiqueta}>{c.etiqueta}</Text>
            <Text style={styles.detalle}>{c.detalle}</Text>
            <Text style={styles.fuente}>
              {c.fuente} · {c.consultado_en}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  dot: { fontSize: 22, marginRight: 12 },
  body: { flex: 1 },
  etiqueta: { fontSize: 16, fontWeight: '600' },
  detalle: { fontSize: 14, color: '#333', marginTop: 2 },
  fuente: { fontSize: 11, color: '#888', marginTop: 4 },
});
```

- [ ] **Step 4: Run it — expect pass**

Run: `npm test -- Semaforo`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/Semaforo.tsx mobile/src/components/CheckList.tsx mobile/__tests__/Semaforo.test.tsx
git commit -m "feat(mobile): Semaforo and CheckList components"
```

---

### Task B4: "Comparte tu viaje" WhatsApp button (the star feature)

**Files:**
- Create: `mobile/src/components/CompartirViaje.tsx`
- Test: `mobile/__tests__/CompartirViaje.test.tsx`

**Interfaces:**
- Consumes: `construirMensaje`, `urlWhatsapp`, `expo-linking`.
- Produces: `CompartirViaje({ placa, descripcion, hora }: { placa: string; descripcion: string; hora: string })` — a button (`testID="compartir-viaje"`, text "Comparte tu viaje") that on press calls `Linking.openURL(urlWhatsapp(construirMensaje(...)))`.

- [ ] **Step 1: Write the failing test (mock expo-linking)**

`mobile/__tests__/CompartirViaje.test.tsx`:
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { CompartirViaje } from '../src/components/CompartirViaje';

jest.mock('expo-linking', () => ({ openURL: jest.fn() }));

test('opens whatsapp url with trip details on press', () => {
  const { getByTestId } = render(
    <CompartirViaje placa="ABC123" descripcion="Toyota Yaris plata" hora="14:30" />,
  );
  fireEvent.press(getByTestId('compartir-viaje'));
  expect(Linking.openURL).toHaveBeenCalledTimes(1);
  const url = (Linking.openURL as jest.Mock).mock.calls[0][0];
  expect(url).toContain('https://wa.me/?text=');
  expect(decodeURIComponent(url)).toContain('ABC123');
  expect(decodeURIComponent(url)).toContain('Toyota Yaris plata');
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npm test -- CompartirViaje`
Expected: FAIL — cannot find module `CompartirViaje`.

- [ ] **Step 3: Implement**

`mobile/src/components/CompartirViaje.tsx`:
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { construirMensaje, urlWhatsapp } from '../lib/whatsapp';

export function CompartirViaje({
  placa,
  descripcion,
  hora,
}: {
  placa: string;
  descripcion: string;
  hora: string;
}) {
  const onPress = () => {
    const mensaje = construirMensaje({ placa, descripcion, hora });
    Linking.openURL(urlWhatsapp(mensaje));
  };
  return (
    <Pressable testID="compartir-viaje" style={styles.btn} onPress={onPress}>
      <Text style={styles.txt}>📲 Comparte tu viaje</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#25D366', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  txt: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 4: Run it — expect pass**

Run: `npm test -- CompartirViaje`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/CompartirViaje.tsx mobile/__tests__/CompartirViaje.test.tsx
git commit -m "feat(mobile): Comparte tu viaje WhatsApp button"
```

---

### Task B5: Pasajero screen (wire it together) + tab layout

This task is screen wiring. It has no new unit test (the logic pieces are already tested); it ends with a manual run on a device/simulator.

**Files:**
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/index.tsx` (Pasajero)
- Create: `mobile/app/comprador.tsx`
- Create: `mobile/app/conductor.tsx`
- Modify: `mobile/package.json` (`"main": "expo-router/entry"`)
- Modify: `mobile/app.json` (add expo-router plugin + scheme)

**Interfaces:**
- Consumes: `verificarPasajero`, `Semaforo`, `CheckList`, `CompartirViaje`.
- Produces: a working Pasajero flow — enter plate → verdict → checks → share. Comprador/Conductor screens are present (placeholder copy is NOT allowed; give each a minimal real form per the stubs below).

- [ ] **Step 1: Configure expo-router entry**

In `mobile/package.json`, set `"main": "expo-router/entry"`.
In `mobile/app.json` under `"expo"`, add:
```json
"scheme": "subeseguro",
"plugins": ["expo-router"]
```

- [ ] **Step 2: Tab layout**

`mobile/app/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerTitle: 'SubeSeguro' }}>
      <Tabs.Screen name="index" options={{ title: 'Pasajero' }} />
      <Tabs.Screen name="comprador" options={{ title: 'Comprador' }} />
      <Tabs.Screen name="conductor" options={{ title: 'Conductor' }} />
    </Tabs>
  );
}
```

- [ ] **Step 3: Pasajero screen**

`mobile/app/index.tsx`:
```typescript
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { verificarPasajero, type Veredicto } from '../src/api/verificar';
import { Semaforo } from '../src/components/Semaforo';
import { CheckList } from '../src/components/CheckList';
import { CompartirViaje } from '../src/components/CompartirViaje';

export default function Pasajero() {
  const [placa, setPlaca] = useState('');
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const verificar = async () => {
    setError('');
    setVeredicto(null);
    setCargando(true);
    try {
      setVeredicto(await verificarPasajero(placa.trim().toUpperCase()));
    } catch {
      setError('No pudimos verificar. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  const descripcion = veredicto?.checks.find((c) => c.clave === 'vehiculo')?.detalle ?? '';
  const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <ScrollView contentContainerStyle={styles.c}>
      <Text style={styles.h}>Revisa antes de subir</Text>
      <TextInput
        testID="input-placa"
        style={styles.input}
        placeholder="Placa (ej. ABC123)"
        autoCapitalize="characters"
        value={placa}
        onChangeText={setPlaca}
      />
      <Pressable testID="btn-verificar" style={styles.btn} onPress={verificar}>
        <Text style={styles.btnTxt}>Verificar</Text>
      </Pressable>
      {cargando && <ActivityIndicator style={{ marginTop: 16 }} />}
      {error !== '' && <Text style={styles.err}>{error}</Text>}
      {veredicto && (
        <View style={{ marginTop: 16 }}>
          <Semaforo veredicto={veredicto} />
          <CheckList checks={veredicto.checks} />
          <CompartirViaje placa={veredicto.placa} descripcion={descripcion} hora={hora} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { padding: 20 },
  h: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, fontSize: 18 },
  btn: { backgroundColor: '#1565C0', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  err: { color: '#E53935', marginTop: 12 },
});
```

- [ ] **Step 4: Comprador + Conductor screens (minimal real forms)**

`mobile/app/comprador.tsx`:
```typescript
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { verificarPasajero, type Veredicto } from '../src/api/verificar';
import { Semaforo } from '../src/components/Semaforo';
import { CheckList } from '../src/components/CheckList';

export default function Comprador() {
  const [placa, setPlaca] = useState('');
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);

  const verificar = async () => {
    setVeredicto(await verificarPasajero(placa.trim().toUpperCase()));
  };

  return (
    <ScrollView contentContainerStyle={styles.c}>
      <Text style={styles.h}>Verifica antes de comprar</Text>
      <TextInput style={styles.input} placeholder="Placa" autoCapitalize="characters"
        value={placa} onChangeText={setPlaca} />
      <Pressable style={styles.btn} onPress={verificar}>
        <Text style={styles.btnTxt}>Verificar vehículo</Text>
      </Pressable>
      {veredicto && (<><Semaforo veredicto={veredicto} /><CheckList checks={veredicto.checks} /></>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { padding: 20 },
  h: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, fontSize: 18 },
  btn: { backgroundColor: '#1565C0', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 12 },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
```

`mobile/app/conductor.tsx`:
```typescript
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, Image, StyleSheet } from 'react-native';
import { crearQrConductor } from '../src/api/verificar';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Conductor() {
  const [placa, setPlaca] = useState('');
  const [dni, setDni] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const generar = async () => {
    const { report_id } = await crearQrConductor(placa.trim().toUpperCase(), dni.trim());
    setQrUrl(`${API}/conductor/qr.png?report_id=${report_id}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.c}>
      <Text style={styles.h}>Conductor verificado</Text>
      <TextInput style={styles.input} placeholder="Placa" autoCapitalize="characters"
        value={placa} onChangeText={setPlaca} />
      <TextInput style={styles.input} placeholder="DNI" keyboardType="number-pad"
        value={dni} onChangeText={setDni} />
      <Pressable style={styles.btn} onPress={generar}>
        <Text style={styles.btnTxt}>Generar mi QR</Text>
      </Pressable>
      {qrUrl !== '' && <Image style={styles.qr} source={{ uri: qrUrl }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { padding: 20 },
  h: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, fontSize: 18, marginBottom: 10 },
  btn: { backgroundColor: '#1565C0', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 12 },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  qr: { width: 240, height: 240, alignSelf: 'center', marginTop: 16 },
});
```

- [ ] **Step 5: Run the full mobile test suite**

Run: `npm test`
Expected: all suites pass (smoke, colores, whatsapp, verificar, Semaforo, CompartirViaje).

- [ ] **Step 6: Manual run against the backend**

Run backend (`uvicorn app.main:app --port 8000`) then:
```bash
cd mobile
EXPO_PUBLIC_API_URL=http://<your-LAN-ip>:8000 npx expo start
```
Verify on Expo Go / simulator: enter a plate → tap Verificar → see semáforo + checks → tap "Comparte tu viaje" → WhatsApp opens with the trip card. Switch tabs → Conductor → generate QR → QR image renders.

- [ ] **Step 7: Commit**

```bash
git add mobile/app/ mobile/package.json mobile/app.json
git commit -m "feat(mobile): pasajero/comprador/conductor screens wired to backend"
```

---

### Task B6: Camera plate capture → OCR (optional input path)

Adds photo input on the Pasajero screen: take/pick a photo, POST to `/ocr/placa`, prefill the plate field with the first candidate.

**Files:**
- Create: `mobile/src/api/ocr.ts`
- Modify: `mobile/app/index.tsx` (add a "Tomar foto" button)
- Test: `mobile/__tests__/ocr.test.ts`

**Interfaces:**
- Consumes: `expo-image-picker`, `api`.
- Produces: `ocrPlaca(uri: string): Promise<string[]>` — uploads the image as multipart `imagen`, returns `candidatas`.

- [ ] **Step 1: Write the failing test (mock api)**

`mobile/__tests__/ocr.test.ts`:
```typescript
import { api } from '../src/api/client';
import { ocrPlaca } from '../src/api/ocr';

jest.mock('../src/api/client', () => ({ api: { post: jest.fn() } }));

test('ocrPlaca returns candidatas from backend', async () => {
  (api.post as jest.Mock).mockResolvedValue({ data: { candidatas: ['ABC123'] } });
  const out = await ocrPlaca('file:///tmp/p.jpg');
  expect(out).toEqual(['ABC123']);
  expect(api.post).toHaveBeenCalledWith(
    '/ocr/placa',
    expect.any(FormData),
    expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
  );
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `npm test -- ocr`
Expected: FAIL — cannot find module `../src/api/ocr`.

- [ ] **Step 3: Implement the OCR API call**

`mobile/src/api/ocr.ts`:
```typescript
import { api } from './client';

export async function ocrPlaca(uri: string): Promise<string[]> {
  const form = new FormData();
  // React Native FormData file shape
  form.append('imagen', { uri, name: 'placa.jpg', type: 'image/jpeg' } as unknown as Blob);
  const { data } = await api.post('/ocr/placa', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.candidatas as string[];
}
```

- [ ] **Step 4: Run it — expect pass**

Run: `npm test -- ocr`
Expected: PASS.

- [ ] **Step 5: Wire the camera button into Pasajero**

In `mobile/app/index.tsx`, add the import and a button above "Verificar":
```typescript
import * as ImagePicker from 'expo-image-picker';
import { ocrPlaca } from '../src/api/ocr';
```
Add this handler inside the component:
```typescript
const tomarFoto = async () => {
  const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
  if (res.canceled || !res.assets?.[0]) return;
  const candidatas = await ocrPlaca(res.assets[0].uri);
  if (candidatas[0]) setPlaca(candidatas[0]);
};
```
Add this button JSX right after the `TextInput`:
```typescript
<Pressable testID="btn-foto" style={[styles.btn, { backgroundColor: '#455A64' }]} onPress={tomarFoto}>
  <Text style={styles.btnTxt}>📷 Tomar foto de la placa</Text>
</Pressable>
```

- [ ] **Step 6: Run the full mobile suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/api/ocr.ts mobile/app/index.tsx mobile/__tests__/ocr.test.ts
git commit -m "feat(mobile): camera plate capture via backend OCR"
```

---

### Task B7: Root README + demo script

**Files:**
- Modify: repo-root `README.md` (add "Run the new stack" section, keep existing pitch)
- Create: `docs/DEMO_SCRIPT.md`

**Interfaces:**
- Consumes: everything.
- Produces: a single page that gets a judge from zero to a working demo.

- [ ] **Step 1: Append run instructions to root `README.md`**

Add a section:
```markdown
## Stack (Expo + FastAPI)

### Backend
cd backend && python3.11 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev,ocr]"
cp .env.example .env   # set JSONPE_TOKEN
uvicorn app.main:app --port 8000

### Mobile
cd mobile && npm install
EXPO_PUBLIC_API_URL=http://<LAN-ip>:8000 npx expo start
```

- [ ] **Step 2: Write the demo script**

`docs/DEMO_SCRIPT.md`:
```markdown
# Demo — SubeSeguro

1. "Voy a tomar un taxi." Abro la app, pestaña Pasajero.
2. Escribo (o fotografío) la placa → toco Verificar.
3. En ~5s aparece el semáforo: 🔴/🟡/🟢 + detalle por fuente (SOAT, vehículo, revisión técnica) con timestamp.
4. Caso 🔴: "Este taxi tiene SOAT vencido — no subo."
5. Toco "Comparte tu viaje" → WhatsApp abre con placa + descripción + hora para un contacto.
6. Pestaña Conductor: el taxista genera su QR de "conductor verificado" que re-consulta en tiempo real.

Backup: tener grabado un video por si falla la red.
Casos de prueba: una placa con SOAT vigente (🟢) y una con SOAT vencido (🔴).
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/DEMO_SCRIPT.md
git commit -m "docs: run instructions and demo script for Expo+FastAPI stack"
```

---

## Self-Review notes (coverage against the spec)

- **Plate → verdict (semáforo, worst-of, simple explanation):** Tasks A4, A8, A9, B3.
- **SOAT vigente/vencido/por-vencer:** A2/A3 (json.pe), A6 (APESEG fallback), A4 (scoring incl. "por vencer" amber).
- **Vehicle data (marca/modelo/color) for clone detection:** A2 (`VehiculoInfo`), A4 (`vehiculo_check`). Visual color-match anti-clonación (YOLOv8/CLIP) is explicitly deferred to its own plan (note in A12) — it needs a model + threshold + live image pipeline; not buildable as no-placeholder TDD here.
- **Licencia (driver mode, category, validity) + QR "conductor verificado":** A2 (`LicenciaInfo`), A4 (`licencia_check`), A10 (QR + live re-query), B5 (Conductor screen).
- **"Comparte tu viaje" WhatsApp (star feature):** B1 (`whatsapp.ts`), B4 (`CompartirViaje`), wired in B5.
- **json.pe single provider, Bearer, cache by plate, thin proxy:** A2 (client), A5 (cache), A8 (cache by plate), A9 (proxy endpoint). Scraping fallback (user said "scrap if necessary"): A6, A7.
- **Full SubeSeguro 3 modules:** Pasajero (A9/B5), Comprador (A12/B5), Conductor (A10/B5).
- **Privacy / source+timestamp / SHA-256 integrity:** Global Constraints, `Check.fuente/consultado_en` everywhere, A10 `firmar`.
- **Expo + FastAPI stack:** Part A (FastAPI), Part B (Expo).

**Deferred to separate plans (flagged, not silently dropped):** SUNARP gravámenes/Alerta Robo (Playwright + CAPTCHA, no stable fixture), SAT Lima multas, latinfo.dev empresa KYB, RENIEC DNI name lookup beyond licencia, and vision-based clone detection. Each needs live-portal inspection or an ML model and should be its own plan per the writing-plans scope rule.
