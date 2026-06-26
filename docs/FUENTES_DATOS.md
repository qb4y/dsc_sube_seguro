# Fuentes de Datos del Estado — SafeCheck Perú

Principio: **nosotros no somos la fuente. El Estado es la fuente.**
El app consulta en tiempo real y presenta — nunca inventa ni almacena datos de vehículos.

---

## APIs de terceros (wrappean datos oficiales)

### placaapi.pe — PRINCIPAL
- **Qué da**: 15 campos: marca, modelo, color, año, VIN, serie, motor, propietario
- **Fuente**: MTC en tiempo real
- **Precio**: S/0.07/consulta — 10 gratis (suficiente para demo hackathon)
- **Formato**: JSON / XML (SOAP)
- **URL**: https://www.placaapi.pe/

### latinfo.dev — Empresas vendedoras
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
  ✅ placaapi.pe          → datos básicos vehículo
  ✅ APESEG scraping      → SOAT
  ✅ MTC CITV scraping    → revisión técnica
  ✅ EasyOCR              → leer placa de foto

FASE 2 — Demo completo:
  ⬜ SUNARP scraping      → gravámenes
  ⬜ SAT Lima scraping    → multas
  ⬜ apiperu.dev          → DNI vendedor
  ⬜ YOLOv8               → detección color/tipo (anti-clonación)

FASE 3 — Bonus:
  ⬜ Claude API           → análisis contrato
  ⬜ latinfo.dev          → vendedor empresa
  ⬜ QR dinámico          → módulo conductor
```
