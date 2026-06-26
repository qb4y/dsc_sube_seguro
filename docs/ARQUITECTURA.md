# Arquitectura Técnica — SafeCheck Perú

## Flujo general

```
INPUT
  📷 Foto placa    → EasyOCR → texto placa
  ⌨️  Texto placa  → directo
  📄 Contrato PDF  → Claude API → extrae placa, DNI, precio
                                         │
                                         ▼
                              CAPA DE SERVICIOS
                    ┌──────────────────────────────┐
                    │  placaapi.pe  → datos MTC    │
                    │  APESEG       → SOAT         │
                    │  MTC CITV     → rev. técnica │
                    │  SUNARP       → gravámenes   │
                    │  PNP          → robo/req.    │
                    │  SAT Lima     → multas       │
                    │  RENIEC       → DNI vendedor │
                    │  SUNAT/latinfo→ RUC empresa  │
                    └──────────────────────────────┘
                                         │
                                         ▼
                                   IA ANALYSIS
                    ┌──────────────────────────────┐
                    │  YOLOv8/CLIP → color/tipo    │
                    │  vs MTC data → ¿clonada?     │
                    │                              │
                    │  Claude API → reporte NL     │
                    │  Score riesgo 0-100           │
                    └──────────────────────────────┘
                                         │
                                         ▼
OUTPUT
  🔴🟡🟢 Semáforo riesgo
  📋 Detalle por verificación + fuente + timestamp
  📱 QR dinámico (conductor/vendedor)
  📄 Reporte lenguaje natural
```

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Streamlit |
| OCR placa | EasyOCR |
| Detección vehículo | YOLOv8 o CLIP |
| LLM contratos/reporte | Claude API (`claude-sonnet-4-6`) |
| Datos placa | placaapi.pe REST |
| SOAT | Scraping APESEG |
| Revisión técnica | Scraping MTC CITV |
| SUNARP | Scraping consultavehicular.sunarp.gob.pe |
| Empresas | latinfo.dev API |
| QR | `qrcode` library |
| Integridad | SHA-256 hash por reporte |

---

## Módulos del sistema

### Módulo 1 — Pasajero

```
Input:  foto/texto placa
Checks: datos vehículo, SOAT, rev. técnica,
        habilitación transporte, robado, placa clonada
Output: semáforo + detalle
```

### Módulo 2 — Comprador

```
Input:  foto/texto placa + foto/PDF contrato + DNI vendedor
Checks: datos vehículo, SOAT, rev. técnica, gravámenes SUNARP,
        historial transferencias, multas SAT, robado,
        DNI vendedor RENIEC, análisis cláusulas contrato
Output: reporte compra completo + alertas
```

### Módulo 3 — Conductor / Vendedor

```
Input:  DNI propio + placa vehículo
Checks: todos los datos de su propio vehículo
Output: QR dinámico compartible + dashboard personal
        + alertas próximos vencimientos
```

---

## Feature: Detección de Placa Clonada

```python
# 1. Consultar MTC → color y tipo oficial del vehículo
mtc_data = {"color": "BLANCO", "categoria": "SEDAN"}

# 2. Analizar foto con visión IA
foto_data = modelo_vision.predict(imagen)
# → {"color_detectado": "ROJO", "tipo_detectado": "SUV"}

# 3. Comparar
if mtc_data["color"] != foto_data["color_detectado"]:
    alerta("POSIBLE PLACA CLONADA: color no coincide con registro MTC")
```

---

## Seguridad de datos

```python
import hashlib, json
from datetime import datetime

def generar_reporte(datos: dict) -> dict:
    datos["timestamp"] = datetime.utcnow().isoformat()
    datos["fuentes"] = ["MTC", "APESEG", "SUNARP"]
    hash_val = hashlib.sha256(
        json.dumps(datos, sort_keys=True).encode()
    ).hexdigest()
    datos["integridad"] = hash_val
    return datos
```

Cada QR de conductor contiene solo `id_reporte` — al escanear re-consulta en tiempo real, nunca datos cacheados.

---

## Estructura de archivos

```
src/
├── app.py                    # Streamlit entry point
├── modules/
│   ├── pasajero.py           # UI módulo pasajero
│   ├── comprador.py          # UI módulo comprador
│   └── conductor.py          # UI módulo conductor/vendedor
├── services/
│   ├── placa_api.py          # placaapi.pe wrapper
│   ├── soat.py               # APESEG scraping
│   ├── revision_tecnica.py   # MTC CITV scraping
│   ├── sunarp.py             # SUNARP gravámenes
│   ├── sat.py                # SAT Lima multas
│   ├── reniec.py             # DNI lookup
│   └── latinfo.py            # Empresas SUNAT/OSCE
├── ai/
│   ├── ocr.py                # EasyOCR placa
│   ├── vehicle_vision.py     # Detección color/tipo
│   └── contract_reader.py    # Claude API contratos
└── utils/
    ├── score.py              # Cálculo score riesgo
    ├── qr_generator.py       # QR dinámico
    └── report.py             # Reporte + hash integridad
```
