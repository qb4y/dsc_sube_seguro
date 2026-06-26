# Seguridad y privacidad — SubeSeguro

Principio: **el Estado es la fuente; nosotros solo consultamos y presentamos.** Nunca inventamos ni almacenamos datos de vehículos.

---

## Privacidad de datos

- **Sin persistencia.** El backend no guarda datos de vehículos en disco. Único almacenamiento: cache **en memoria** con TTL por placa (`CACHE_TTL_SECONDS`, default 600s). Al reiniciar, vacío.
- **Sin datos personales del pasajero.** La entrada es la placa, leída del vehículo. No se pide identidad de quien consulta.
- **Modo conductor con consentimiento.** La licencia solo se consulta cuando el propio conductor genera su QR (entrega placa + DNI).
- **Trazabilidad.** Cada `Check` lleva `fuente` + `consultado_en` (UTC ISO-8601). El usuario ve de dónde y cuándo viene cada dato.

---

## Integridad de reportes

- Cada reporte puede firmarse con `sha256(APP_SECRET + json_canónico(veredicto))` (`services/report.py::firmar`).
- El hash detecta adulteración de un reporte compartido.
- El QR de conductor codifica solo un `report_id`; al escanear, `GET /conductor/verify/{id}` **re-consulta en tiempo real** — nunca sirve datos cacheados viejos más allá del TTL.

---

## Secretos

| Variable | Uso | Dónde |
|----------|-----|-------|
| `JSONPE_TOKEN` | Bearer de json.pe | `backend/.env` (gitignored) |
| `ANTHROPIC_API_KEY` | Claude (análisis de contrato) | `backend/.env` |
| `APP_SECRET` | Firma SHA-256 de reportes | `backend/.env` |

- `.env` está en `.gitignore`. Solo se versiona `.env.example` sin valores.
- El token json.pe **nunca** llega al cliente — vive solo en el backend (razón de ser del proxy).

---

## Degradación segura

- Si una fuente falla, su señal sale 🟡 (precaución), nunca 🟢. Conservador por diseño (ver [DECISIONES.md](DECISIONES.md), ADR-3).
- El endpoint nunca devuelve 500 por una fuente caída — degrada a ámbar con detalle explicativo.

---

## Límite de alcance

SubeSeguro informa con datos oficiales; **no** afirma legalidad ni reemplaza una verificación registral formal. El veredicto es una ayuda de decisión rápida, no una certificación.
