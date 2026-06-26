# SubeSeguro

> Revisa antes de subir: en segundos sabes si el vehículo está asegurado, si es el auto real, y tu familia sabe en cuál estás.

Verificador de vehículos que combina datos oficiales del Estado peruano en un veredicto simple: 🟢 seguro · 🟡 precaución · 🔴 riesgo.

Proyecto para **Hackathon DSC PUCP** — Tema: *Estado Peruano* · Equipo **MACHAZ**

---

## El problema

- **18 vehículos robados por día** en Lima
- **+6,000 taxis informales** intervenidos en 2025 (ATU)
- SUNARP lanzó "Alerta Clonación" en marzo 2025
- Verificar el SOAT hoy exige entrar a la web de APESEG o de cada aseguradora — nadie lo hace antes de subir

---

## La solución

Con solo la **placa** (que el pasajero lee del vehículo, sin datos personales) la app consulta y combina:

- **SOAT** → vigente, vencido o por vencer
- **Datos del vehículo** (marca, modelo, color) → detecta placas clonadas
- **Licencia** (modo conductor, opcional) → categoría y vigencia, con QR de "conductor verificado"

El veredicto final es **el peor de las señales**, con explicación en lenguaje simple.

### Función estrella — "Comparte tu viaje"

Antes de subir, envías por WhatsApp una tarjeta con placa + descripción verificada del auto + hora a un contacto de confianza.

### 3 módulos

| Módulo | Usuario | Qué hace |
|--------|---------|----------|
| **Pasajero** | Quien va a tomar un taxi | Verifica el taxi antes de subir |
| **Comprador** | Quien va a comprar un vehículo | Verifica el vehículo (+ análisis de contrato) |
| **Conductor** | Taxista / vendedor | Genera QR de confianza que re-consulta en tiempo real |

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | Expo (React Native + TypeScript), expo-router |
| Backend | FastAPI (Python 3.11+), Uvicorn, httpx, pydantic v2 |
| Datos | **json.pe** (Bearer token) — SOAT (APESEG), placa (SUTRAN), licencia (MTC) |
| Fallback | Scraping APESEG / MTC CITV (BeautifulSoup) cuando json.pe no tiene el dato |
| OCR placa | EasyOCR |
| Contratos | Claude API (`claude-sonnet-4-6`) |
| QR | `qrcode` |
| Integridad | SHA-256 por reporte |

**Principio:** no almacenamos datos de vehículos. Cada consulta va a la fuente; cada dato muestra fuente + timestamp. El backend solo cachea en memoria por placa (TTL).

---

## Estructura del repo

```
backend/        API FastAPI (proxy json.pe + scoring + OCR + QR + contratos)
mobile/         App Expo (pasajero / comprador / conductor)
docs/
  ARQUITECTURA.md                        arquitectura del sistema
  API.md                                 contrato HTTP del backend
  DECISIONES.md                          decisiones de diseño (ADR)
  SEGURIDAD.md                           seguridad y privacidad
  FUENTES_DATOS.md                       fuentes oficiales del Estado
  DEMO_SCRIPT.md                         guion de demo
  superpowers/plans/                     plan de implementación (TDD, paso a paso)
```

> `backend/` y `mobile/` se crean durante la implementación. El plan completo está en
> [`docs/superpowers/plans/2026-06-26-subeseguro.md`](docs/superpowers/plans/2026-06-26-subeseguro.md).

---

## Cómo correr

### Backend
```bash
cd backend
python3.11 -m venv .venv && . .venv/bin/activate   # requiere Python 3.11+
pip install -e ".[dev,ocr]"
cp .env.example .env        # set JSONPE_TOKEN, ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Mobile
```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<tu-IP-LAN>:8000 npx expo start
```

---

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [API del backend](docs/API.md)
- [Decisiones de diseño (ADR)](docs/DECISIONES.md)
- [Seguridad y privacidad](docs/SEGURIDAD.md)
- [Fuentes de datos del Estado](docs/FUENTES_DATOS.md)
- [Guion de demo](docs/DEMO_SCRIPT.md)
- [Plan de implementación](docs/superpowers/plans/2026-06-26-subeseguro.md)
