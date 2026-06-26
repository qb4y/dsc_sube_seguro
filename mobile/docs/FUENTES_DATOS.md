# Fuentes de Datos del Estado — SubeSeguro

Principio: **nosotros no somos la fuente. El Estado es la fuente.**
El app consulta en tiempo real y presenta — nunca inventa ni almacena datos de vehículos.

---

## APIs de terceros (wrappean datos oficiales)

### json.pe — PRINCIPAL
- **Qué da**: SOAT (APESEG), datos de placa (SUTRAN), licencia (MTC) — un solo proveedor
- **Fuente**: APESEG / SUTRAN / MTC
- **Precio**: plan gratis 100 créditos (suficiente para demo hackathon)
- **Formato**: JSON, auth `Authorization: Bearer <token>`
- **URL**: https://json.pe/
- **Nota**: shapes de respuesta se verifican contra la API en vivo (Task A3 del plan); el adapter en `backend/app/clients/jsonpe.py` aísla los nombres de campos.

### latinfo.dev — Empresas vendedoras (opcional, fase posterior)
- **Qué da**: RUC, estado SUNAT, sanciones OSCE, deudas coactivas, contratos SEACE
- **Fuente**: SUNAT, OSCE, OEFA, SEACE
- **Precio**: 1,000 consultas/mes gratis
- **URL**: https://api.latinfo.dev/pe
- **Endpoint**: `GET /pe/kyb/{ruc}`

---

## Portales oficiales del Estado (scraping)

### MTC — Revisión técnica (CITV)
- **URL**: https://rec.mtc.gob.pe/Citv/ArConsultaCitv
- **Input**: número de placa
- **Output**: vigencia revisión técnica, empresa CITV, fecha vencimiento
- **Método**: requests + BeautifulSoup (formulario simple)

### APESEG — SOAT
- **URL**: https://www.apeseg.org.pe/
- **Input**: número de placa
- **Output**: SOAT vigente, aseguradora, fecha vencimiento
- **Método**: scraping portal público

### SUNARP — Gravámenes vehiculares
- **URL**: https://consultavehicular.sunarp.gob.pe/
- **Input**: número de placa
- **Output**: propietario registrado, gravámenes, hipotecas, historial transferencias
- **Método**: scraping (requiere playwright por JS)

### SUNARP — Alerta Robo
- **URL**: https://alertarobo.sunarp.gob.pe/
- **Input**: número de placa
- **Output**: si el vehículo está reportado como robado
- **Método**: scraping

### SAT Lima — Multas
- **URL**: https://www.sat.gob.pe/
- **Input**: número de placa
- **Output**: infracciones pendientes, monto deuda
- **Método**: scraping portal público

### MTC — Habilitación transporte
- **URL**: https://portal.mtc.gob.pe/transportes/terrestre/
- **Input**: número de placa / empresa
- **Output**: habilitación transporte público, categoría
- **Método**: scraping

---

## APIs complementarias (identidad)

### apiperu.dev — DNI / RUC
- **Qué da**: nombre completo desde DNI, datos empresa desde RUC
- **Fuente**: SUNAT / RENIEC
- **Precio**: 100 consultas/mes gratis, S/5/mes para 2,500
- **URL**: https://apiperu.dev/

---

## Datos estadísticos de contexto (no tiempo real)

| Fuente | Dato | URL |
|--------|------|-----|
| INEI | Estadísticas robo vehículos | inei.gob.pe |
| MTC | Parque automotor Perú | gob.pe/mtc |
| PNP | Informe robo/hurto vehículos Lima 2025 | cdn.www.gob.pe |
| SUNARP | Estadísticas clonación | sunarp.gob.pe |

---

## Prioridad de implementación

```
FASE 1 — MVP hackathon:
  ✅ json.pe             → SOAT + datos vehículo + licencia
  ✅ APESEG scraping     → SOAT (fallback si json.pe no lo trae)
  ✅ MTC CITV scraping   → revisión técnica (fallback)
  ✅ EasyOCR             → leer placa de foto
  ✅ Claude API          → análisis de contrato (módulo comprador)
  ✅ QR dinámico         → módulo conductor

FASE 2 — Plan aparte (requiere portal en vivo / modelo ML):
  ⬜ SUNARP scraping      → gravámenes / Alerta Robo (Playwright + CAPTCHA)
  ⬜ SAT Lima scraping    → multas
  ⬜ latinfo.dev          → vendedor empresa (KYB)
  ⬜ YOLOv8 / CLIP        → detección color/tipo (anti-clonación visual)
```
