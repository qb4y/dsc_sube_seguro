# Features completos — SafeCheck Perú

Todas las fuentes usan **json.pe** como proveedor único de datos del Estado.

---

## Módulo 1 — Pasajero (verificar taxi antes de subir)

| # | Feature | API/Fuente | Fase |
|---|---------|-----------|------|
| P1 | OCR placa desde foto | EasyOCR (local) | MVP |
| P2 | Datos vehículo: marca, modelo, color, año, VIN | json.pe `/vehiculo` | MVP |
| P3 | SOAT vigente / vencido / por vencer | json.pe `/soat` | MVP |
| P4 | Revisión técnica vigente | json.pe o MTC CITV scraping | MVP |
| P5 | Habilitación transporte público / taxi | MTC scraping | Fase 2 |
| P6 | Licencia conductor vigente + categoría | json.pe `/licencia` | MVP |
| P7 | Vehículo reportado como robado | PNP scraping | Fase 2 |
| P8 | Detección placa clonada (color/tipo vs MTC) | YOLOv8 + json.pe | Fase 3 |
| P9 | Score de riesgo semáforo 🔴🟡🟢 | Lógica interna (worst-of) | MVP |
| P10 | Reporte con fuente + timestamp por check | Lógica interna | MVP |
| P11 | "Comparte tu viaje" vía WhatsApp | expo-linking | MVP |

---

## Módulo 2 — Comprador (verificar antes de comprar)

| # | Feature | API/Fuente | Fase |
|---|---------|-----------|------|
| C1 | Todos los checks del módulo Pasajero | — | MVP |
| C2 | Gravámenes e hipotecas sobre el vehículo | SUNARP scraping | Fase 2 |
| C3 | Historial de transferencias (cuántos dueños) | SUNARP scraping | Fase 2 |
| C4 | Multas pendientes del vehículo | SAT Lima scraping | Fase 2 |
| C5 | Lectura automática de contrato (PDF/foto) | EasyOCR + Claude API | MVP |
| C6 | Análisis de cláusulas del contrato | Claude API | MVP |
| C7 | Verificar DNI del vendedor persona natural | json.pe `/dni` | Fase 2 |
| C8 | Verificar RUC del vendedor empresa | json.pe `/ruc` | Fase 2 |
| C9 | Verificar identidad vendedor = propietario MTC | json.pe cruce | Fase 2 |

---

## Módulo 3 — Conductor / Vendedor (mostrar que es confiable)

| # | Feature | API/Fuente | Fase |
|---|---------|-----------|------|
| D1 | Consultar estado de mis propios documentos | json.pe | MVP |
| D2 | Generar QR dinámico compartible | qrcode lib | MVP |
| D3 | QR re-consulta en tiempo real al escanear | Backend re-query | MVP |
| D4 | Hash SHA-256 de integridad del reporte | hashlib | MVP |
| D5 | Alertas: SOAT/rev. técnica por vencer (<30 días) | json.pe + scoring | Fase 2 |
| D6 | Push notification cuando algo vence | Expo notifications | Fase 3 |
| D7 | Dashboard historial de consultas propias | Backend + DB | Fase 3 |

---

## API única: json.pe

Reemplaza a todos los proveedores anteriores:

| Endpoint json.pe | Dato |
|-----------------|------|
| `/vehiculo/{placa}` | Marca, modelo, color, año, VIN |
| `/soat/{placa}` | SOAT vigente, aseguradora, vencimiento |
| `/licencia/{dni}` | Licencia, categoría, vigencia |
| `/dni/{dni}` | Nombre completo RENIEC |
| `/ruc/{ruc}` | Empresa SUNAT, estado, tipo |

Scrapers solo como fallback si json.pe no cubre el dato:
- MTC CITV → revisión técnica
- APESEG → SOAT (fallback)
- SUNARP → gravámenes (Fase 2)
- SAT Lima → multas (Fase 2)
- PNP → robado (Fase 2)
- MTC → habilitación transporte (Fase 2)
