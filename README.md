# SafeCheck Perú

> Verificador inteligente de vehículos usando datos oficiales del Estado peruano.

Proyecto para **Hackathon DSC PUCP** — Tema: *Estado Peruano*

---

## El problema

- **18 vehículos robados por día** en Lima (Peru21)
- **+6,000 taxis informales** intervenidos en 2025 (ATU)
- SUNARP lanzó "Alerta Clonación" en marzo 2025 por magnitud del problema
- Comprar un vehículo usado = riesgo alto de fraude, gravámenes ocultos, robo

No existe una solución unificada que proteja a los 3 actores del mercado.

---

## La solución

SafeCheck consulta en tiempo real datos oficiales del Estado peruano (MTC, SUNARP, APESEG, PNP) y los presenta en una interfaz simple con un score de riesgo.

### 3 módulos

| Módulo | Usuario | ¿Qué hace? |
|--------|---------|-----------|
| **Pasajero** | Persona que va a tomar un taxi | Verifica el taxi antes de subir |
| **Comprador** | Persona que va a comprar un vehículo | Verifica el vehículo antes de comprar |
| **Conductor/Vendedor** | Taxista o vendedor | Genera QR de confianza verificado |

### Inputs

- 📷 Foto de la placa (cámara o upload)
- ⌨️ Número de placa escrito
- 📄 PDF o foto del contrato de compra
- ⌨️ DNI del vendedor / conductor

### Outputs

- Semáforo de riesgo: 🔴 ALTO / 🟡 MEDIO / 🟢 BAJO
- Detalle por verificación con fuente oficial + timestamp
- Detección de placa clonada (IA visión)
- QR compartible con perfil verificado (conductor/vendedor)
- Reporte en lenguaje natural generado por IA

---

## Stack tecnológico

```
Frontend:     Streamlit
OCR placa:    EasyOCR
Visión IA:    YOLOv8 / CLIP (detección color/tipo vehículo)
Contratos:    Claude API (extracción + análisis de cláusulas)
Placa API:    placaapi.pe (datos MTC en tiempo real)
SOAT:         APESEG (scraping)
Rev. técnica: MTC CITV (scraping)
SUNARP:       consultavehicular.sunarp.gob.pe
Empresas:     latinfo.dev (SUNAT/OSCE si vendedor es empresa)
```

---

## Datos del Estado usados

| Fuente | Dato | Módulo |
|--------|------|--------|
| MTC | Marca, modelo, color, año, VIN, propietario | Todos |
| MTC | Habilitación transporte público | Pasajero |
| MTC | Licencia conductor, puntos demerito | Pasajero |
| APESEG | SOAT vigente | Todos |
| MTC CITV | Revisión técnica vigente | Todos |
| SUNARP | Gravámenes, hipotecas, historial transferencias | Comprador |
| PNP | Vehículo reportado como robado | Todos |
| SAT Lima | Multas pendientes | Comprador |
| SUNAT | RUC activo del vendedor empresa | Comprador |
| RENIEC | DNI vendedor persona natural | Comprador |

---

## Seguridad y veracidad de datos

- **No almacenamos datos de vehículos** — cada consulta va directo a la fuente oficial
- Cada dato muestra: fuente + timestamp + link al portal oficial
- QR conductor es dinámico — re-consulta en tiempo real al escanear
- Hash SHA-256 en cada reporte para detectar adulteración

---

## Documentación

- [Arquitectura técnica](docs/ARQUITECTURA.md)
- [Fuentes de datos del Estado](docs/FUENTES_DATOS.md)
- [Plan de desarrollo](docs/PLAN_DESARROLLO.md)

---

## Instalación

```bash
git clone <repo>
cd dsc_pucp_project
pip install -r requirements.txt
cp .env.example .env
# Configurar API keys en .env
streamlit run src/app.py
```

---

## Equipo: MACHAZ

Hackathon DSC PUCP 2025 — Tema: Estado Peruano
