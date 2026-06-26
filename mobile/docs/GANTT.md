# Gantt — SafeCheck Perú

```mermaid
gantt
    title SafeCheck Perú — Roadmap de desarrollo
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section MVP — Hackathon (Día 1)
    A0 Backend scaffold + health          :done, a0,  2026-06-26, 1h
    A1 Modelos internos                   :done, a1,  after a0,   30m
    A2 json.pe client + adapter           :      a2,  after a1,   1h
    A3 Verificar shapes json.pe live      :      a3,  after a2,   30m
    A4 Scoring worst-of                   :      a4,  after a3,   30m
    A5 Cache TTL                          :      a5,  after a4,   30m
    A6 Scraper APESEG SOAT fallback       :      a6,  after a5,   30m
    A7 Scraper MTC CITV fallback          :      a7,  after a6,   30m
    A8 Aggregator + degradación graceful  :      a8,  after a7,   30m
    A9 Endpoint /verificar/pasajero       :      a9,  after a8,   30m
    A10 QR + reporte firmado + conductor  :      a10, after a9,   1h
    A11 OCR placa endpoint                :      a11, after a10,  30m
    A12 Comprador + Claude contrato       :      a12, after a11,  1h
    B0 Expo scaffold + jest               :      b0,  2026-06-26, 1h
    B1 Colores + WhatsApp lib             :      b1,  after b0,   30m
    B2 API client typed                   :      b2,  after b1,   30m
    B3 Semáforo + CheckList components    :      b3,  after b2,   30m
    B4 Comparte tu viaje WhatsApp         :      b4,  after b3,   30m
    B5 Pantallas Pasajero/Comprador/Conductor :  b5,  after b4,   1h
    B6 Cámara → OCR placa                 :      b6,  after b5,   30m
    B7 README + demo script               :      b7,  after b6,   30m

    section Fase 2 — Post hackathon (Semana 1-2)
    F2-1 json.pe DNI vendedor             :      f21, 2026-06-30, 2d
    F2-2 json.pe RUC empresa vendedor     :      f22, after f21,  1d
    F2-3 Cruce DNI/RUC vs propietario MTC :      f23, after f22,  1d
    F2-4 PNP robado scraping              :      f24, after f21,  2d
    F2-5 MTC habilitación transporte      :      f25, after f24,  2d
    F2-6 SAT Lima multas scraping         :      f26, after f25,  2d
    F2-7 SUNARP gravámenes (Playwright)   :      f27, after f26,  3d
    F2-8 SUNARP historial transferencias  :      f28, after f27,  1d
    F2-9 Alertas vencimiento (push local) :      f29, after f28,  2d

    section Fase 3 — Avanzado (Semana 3-4)
    F3-1 Detección placa clonada YOLOv8   :      f31, 2026-07-13, 4d
    F3-2 Pipeline visión: foto → color/tipo vs MTC : f32, after f31, 2d
    F3-3 Upload PDF contrato completo     :      f33, 2026-07-13, 2d
    F3-4 Push notifications Expo          :      f34, after f33,  2d
    F3-5 Dashboard conductor historial    :      f35, after f34,  3d
    F3-6 Persistencia DB (SQLite/Supabase):      f36, after f35,  2d
```

---

## Resumen por fase

### MVP — Hackathon (26 Jun, 8 horas)
**Backend (Tasks A0–A12):**
- Scaffold FastAPI + health check
- Modelos internos (Veredicto, Check, SoatInfo...)
- Cliente json.pe (vehículo + SOAT + licencia)
- Scoring worst-of (🔴🟡🟢)
- Cache TTL en memoria
- Scrapers fallback: APESEG (SOAT) + MTC CITV (rev. técnica)
- Aggregator con degradación graceful
- Endpoints: `/verificar/pasajero`, `/verificar/comprador`, `/conductor/qr`, `/ocr/placa`
- QR dinámico + reporte firmado SHA-256
- Análisis contrato con Claude API

**Mobile (Tasks B0–B7):**
- Expo + React Native + TypeScript + jest
- Pantallas: Pasajero, Comprador, Conductor
- Semáforo + CheckList + "Comparte tu viaje"
- Cámara → OCR → autocompletar placa

**Features cubiertos:** P1–P4, P6, P9–P11, C1, C5, C6, D1–D4

---

### Fase 2 — Semana 1-2 post hackathon
- DNI/RUC vendedor vía json.pe → cruces de identidad
- PNP vehículo robado
- MTC habilitación transporte público / taxi
- SAT Lima multas pendientes
- SUNARP gravámenes e historial de transferencias
- Alertas de vencimiento (SOAT, rev. técnica)

**Features cubiertos:** P5, P7, C2–C4, C7–C9, D5

---

### Fase 3 — Semana 3-4
- Detección placa clonada con YOLOv8 (color/tipo foto vs datos MTC)
- Upload PDF completo con OCR
- Push notifications Expo
- Dashboard historial conductor
- Persistencia con base de datos

**Features cubiertos:** P8, D6, D7
