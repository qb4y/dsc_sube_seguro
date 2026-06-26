# API — SubeSeguro Backend

Base URL: `http://localhost:8000` (dev). Todas las respuestas son JSON salvo `qr.png` (PNG).

CORS abierto en dev (`cors_origins=["*"]`). La placa se normaliza en el backend: mayúsculas, sin espacios ni guiones (`abc-123` → `ABC123`).

---

## Tipos

```jsonc
// Check
{
  "clave": "soat",                 // soat | vehiculo | licencia | revision_tecnica
  "etiqueta": "SOAT",              // texto mostrable
  "color": "rojo",                 // verde | ambar | rojo | desconocido
  "detalle": "SOAT vencido. No es seguro subir.",
  "fuente": "json.pe",            // origen del dato
  "consultado_en": "2026-06-26T14:30:00Z"   // UTC ISO-8601
}

// Veredicto
{
  "color": "rojo",                 // peor de los checks
  "resumen": "Riesgo: revisa las alertas antes de subir.",
  "placa": "ABC123",
  "checks": [ /* Check[] */ ]
}
```

---

## Endpoints

### `GET /health`
Liveness.
```json
{ "status": "ok" }
```

---

### `POST /verificar/pasajero`
Verifica un vehículo para un pasajero (SOAT + vehículo + revisión técnica).

Request:
```json
{ "placa": "ABC123" }
```
Response `200`: `Veredicto`.
Errores: `422` placa vacía/inválida.

---

### `POST /verificar/comprador`
`multipart/form-data`. Reusa el set de señales del pasajero + análisis opcional de contrato (Claude).

| Campo | Tipo | Req. |
|-------|------|------|
| `placa` | form text | sí |
| `contrato` | file (texto/PDF) | no |

Response `200`:
```json
{
  "veredicto": { /* Veredicto */ },
  "contrato": { "alertas": ["..."], "resumen": "..." }   // null si no se envió contrato
}
```

---

### `POST /conductor/qr`
Crea un reporte y devuelve la URL de verificación para el QR.

Request:
```json
{ "placa": "ABC123", "dni": "12345678" }
```
Response `200`:
```json
{ "report_id": "Xy7k...", "qr_url": "/conductor/verify/Xy7k..." }
```

---

### `GET /conductor/verify/{report_id}`
Re-consulta en **tiempo real** la placa del reporte (no devuelve datos cacheados viejos más allá del TTL). Esto sostiene la promesa "el QR re-consulta al escanear".

Response `200`: `Veredicto`.
Errores: `404` reporte no encontrado.

---

### `GET /conductor/qr.png?report_id=...`
PNG del QR que codifica `/conductor/verify/{report_id}`.

Response `200`: `image/png`.
Errores: `404` reporte no encontrado.

---

### `POST /ocr/placa`
`multipart/form-data`, campo file `imagen`. Lee placas con EasyOCR.

Response `200`:
```json
{ "candidatas": ["ABC123"] }   // puede venir vacío si la foto es pobre
```

---

## Notas

- **Degradación elegante:** si una fuente (json.pe o scraper) falla, su `Check` sale 🟡 con detalle "No pudimos consultar esta fuente." — el endpoint nunca devuelve 500 por una fuente caída.
- **Cache:** por placa (`pasajero:{placa}`), en memoria, TTL configurable (`CACHE_TTL_SECONDS`, default 600s).
- **Sin persistencia** de datos de vehículo en disco. Ver [SEGURIDAD.md](SEGURIDAD.md).
