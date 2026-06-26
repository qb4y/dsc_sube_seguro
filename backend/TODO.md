# Backend TODO — SubeSeguro

Orden de ataque para tener módulos funcionales e ir iterando con pruebas reales.

---

## FASE 0 — Entorno `~30 min` ← EMPIEZA AQUÍ

- [x] Crear `backend/.env` con tokens reales (copiar de `.env.example`)
  - [x] `JSONPE_TOKEN` — ✅ configurado
  - [ ] `ANTHROPIC_API_KEY` — pendiente (obtener en https://console.anthropic.com/)
  - [x] `APP_SECRET` — generado con openssl
- [x] Instalar deps: `pip install -e ".[dev]"`
- [ ] Verificar arranque: `uvicorn app.main:app --reload --port 8000`
- [ ] Smoke test: `curl http://localhost:8000/health` → `{"status":"ok"}`

---

## FASE 1 — Verificar shapes de json.pe `~1h` ✅ COMPLETO

Los shapes de respuesta de json.pe son desconocidos — el adapter en
`app/verificacion/infrastructure/jsonpe.py` asume nombres de campos que pueden
no coincidir. Esta fase los verifica contra la API en vivo.

- [ ] Escribir `scripts/probe_jsonpe.py` — pendiente (se hizo probe manual en sesión)
- [x] Correr probe contra API real con placa/DNI de prueba
- [x] Comparar campos reales vs asumidos — shapes confirmados en vivo:
      - `POST /api/soat` → `data.estado/fecha_fin/nombre_compania`
      - `POST /api/placa` → `data.marca/modelo/color/anio`
      - `POST /api/licencia` → `data.licencia.estado/categoria/fecha_vencimiento`
      - `POST /api/revision-tecnica` → array `[0].estado/resultado_inspeccion`
- [x] Ajustar `app/verificacion/infrastructure/jsonpe.py` según campos reales
- [x] Actualizar fixtures en `tests/fixtures/jsonpe_*.json` con respuestas reales
- [x] Re-correr suite: `pytest tests/ -v` → 35 passed

---

## FASE 2 — Scrapers reales `~2h`

Los scrapers están escritos pero nunca corrieron contra los portales reales.

### APESEG (SOAT fallback)
- [ ] Correr `app/verificacion/infrastructure/apeseg.py` manualmente contra portal real
- [ ] Verificar que detecta texto "VIGENTE" en el HTML de respuesta
- [ ] Ajustar URL, campos de form, y selector si difieren
- [ ] Agregar fixture HTML real en `tests/fixtures/apeseg_vigente.html`
- [ ] Escribir test con fixture real

### CITV / MTC (revisión técnica)
- [ ] Verificar URL real: `https://rec.mtc.gob.pe/Citv/ArConsultaCitv`
      (el código usa otra — reconciliar con `docs/FUENTES_DATOS.md`)
- [ ] Correr scraper manualmente, inspeccionar HTML de respuesta
- [ ] Ajustar selectores en `app/verificacion/infrastructure/citv.py`
- [ ] Agregar fixture HTML real + test

---

## FASE 3 — Agregador completo `~1h`

Actualmente el aggregator solo usa json.pe. Falta conectar los scrapers como fallback real.

- [ ] En `app/verificacion/application/aggregator.py`:
  - Inyectar `CitvScraper` para añadir check `revision_tecnica` al veredicto del pasajero
  - Inyectar `ApeSegScraper` como fallback cuando json.pe SOAT falla
- [ ] Actualizar `app/verificacion/router.py` para pasar scrapers al aggregator
- [ ] Test e2e con placa peruana real:
  ```bash
  curl -X POST http://localhost:8000/verificar/pasajero \
    -H "Content-Type: application/json" \
    -d '{"placa":"ABC123"}'
  ```
- [ ] Verificar que el veredicto tiene 3 checks: `soat`, `vehiculo`, `revision_tecnica`
- [ ] Verificar degradación: apagar WiFi → todos los checks salen ámbar, no 500

---

## FASE 4 — Módulo conductor funcional `~30 min`

- [ ] Test manual completo del flujo:
  ```bash
  # 1. Crear reporte + QR
  curl -X POST http://localhost:8000/conductor/qr \
    -H "Content-Type: application/json" \
    -d '{"placa":"ABC123","dni":"12345678"}'

  # 2. Verificar (simula escaneo del QR)
  curl http://localhost:8000/conductor/verify/{report_id}

  # 3. Descargar PNG del QR
  curl http://localhost:8000/conductor/qr.png?report_id={report_id} --output qr.png
  ```
- [ ] Abrir `qr.png` y escanearlo con celular → debe abrir `/conductor/verify/{id}`
- [ ] Verificar que el verify hace consulta fresca (no devuelve cache)

---

## FASE 5 — OCR real `~1h`

EasyOCR no está instalado — el plate_reader falla silenciosamente.

- [ ] Instalar: `pip install -e ".[ocr]"` (descarga ~2GB de modelos, solo una vez)
- [ ] Test manual:
  ```bash
  curl -X POST http://localhost:8000/ocr/placa \
    -F "imagen=@foto_placa.jpg"
  ```
- [ ] Verificar que `candidatas` contiene la placa correcta
- [ ] Si el regex en `plate_reader.py` no matchea placas peruanas reales, ajustar patrón
      (placas Perú: `[A-Z]{3}\d{3}` o `[A-Z]{2}\d{4}`)

---

## FASE 6 — Módulo comprador + Claude `~1h`

- [ ] Test manual con contrato real:
  ```bash
  curl -X POST http://localhost:8000/verificar/comprador \
    -F "placa=ABC123" \
    -F "contrato=@contrato.txt"
  ```
- [ ] Verificar que `contrato.alertas` contiene cláusulas en español
- [ ] Si el JSON de Claude viene malformado, ajustar prompt en
      `app/contratos/infrastructure/claude.py`
- [ ] Test sin contrato → `contrato: null` en respuesta (no error)

---

## FASE 7 — Hardening para demo `~1h`

- [ ] Error 401/403 de json.pe → log claro + degradar a ámbar (no 500)
- [ ] Timeout de scrapers: verificar que 15s es suficiente en red peruana
- [ ] Placa inexistente (no en json.pe) → veredicto ámbar + detalle "No encontrado"
- [ ] Placa con formato inválido → 422 con mensaje en español
- [ ] `CORS_ORIGINS` en `.env` apuntando a URL real del frontend
- [ ] Agregar `scripts/probe_jsonpe.py` al repo (sin valores en `.env`)

---

## Orden para el hackathon

```
Fase 0 → 1 → 3 → 4     MVP demo funcional (pasajero + conductor)
Fase 2                  Robustez (scrapers fallback)
Fase 6                  Diferenciador (Claude análisis contrato)
Fase 5                  Nice-to-have (OCR cámara)
Fase 7                  Pulido final antes de demo
```

---

## Comandos útiles

```bash
# desde backend/
source .venv/bin/activate

# correr servidor
uvicorn app.main:app --reload --port 8000

# correr todos los tests
pytest tests/ -v

# correr solo un módulo
pytest tests/verificacion/ -v

# ver coverage
pytest tests/ --cov=app --cov-report=term-missing
```
