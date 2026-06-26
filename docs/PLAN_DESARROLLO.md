# Plan de Desarrollo — Hackathon 8 horas

## Contexto
- **Evento**: Hackathon DSC PUCP
- **Duración**: 10:00 AM — 6:00 PM (8 horas)
- **Tema**: Estado Peruano
- **Proyecto**: SafeCheck Perú

---

## Roles sugeridos (4 personas)

| Persona | Rol | Foco |
|---------|-----|------|
| A | Backend / Datos | servicios de consulta (placaapi, SOAT, CITV) |
| B | IA / OCR | EasyOCR placa + score de riesgo |
| C | Frontend | Streamlit UI, 3 módulos, semáforo |
| D | Pitch / Docs | presentación, demo script, README |

---

## Timeline

### 10:00 — 11:00 | Setup + datos
- [ ] Clonar repo, instalar dependencias
- [ ] Obtener API key placaapi.pe (registro gratis → 10 consultas)
- [ ] Obtener API key apiperu.dev (100 gratis)
- [ ] Probar endpoint placaapi.pe con placa de prueba
- [ ] Probar scraping APESEG y MTC CITV

### 11:00 — 13:00 | Core services + OCR
- [ ] `src/services/placa_api.py` — wrapper placaapi.pe
- [ ] `src/services/soat.py` — scraping APESEG
- [ ] `src/services/revision_tecnica.py` — scraping MTC CITV
- [ ] `src/ai/ocr.py` — EasyOCR leer placa de imagen
- [ ] `src/utils/score.py` — calcular score 0-100

### 13:00 — 14:00 | Almuerzo + planning checkpoint
- Revisar qué servicios funcionan
- Ajustar scope si algo no funciona
- **Mínimo para continuar**: placaapi.pe + OCR funcionando

### 14:00 — 16:00 | UI + integración
- [ ] `src/app.py` — Streamlit con 3 tabs (Pasajero / Comprador / Conductor)
- [ ] Módulo Pasajero: foto/texto → semáforo
- [ ] Módulo Comprador: placa + opcional contrato PDF
- [ ] Módulo Conductor: generar QR básico
- [ ] Integrar todos los services con la UI

### 16:00 — 17:00 | Features IA + polish
- [ ] Detección color vehículo (anti-clonación) — si hay tiempo
- [ ] Análisis contrato con Claude API — si hay tiempo
- [ ] Reporte en lenguaje natural
- [ ] UI polish: colores, iconos, responsive

### 17:00 — 18:00 | Demo prep + pitch
- [ ] Grabar video demo backup (por si falla internet)
- [ ] Preparar caso de uso: placa real conocida con problemas
- [ ] Slide deck: problema → solución → demo → impacto → tech

---

## MVP mínimo para presentar

```
✅ Input: texto placa O foto placa (OCR)
✅ Consulta: placaapi.pe → datos básicos vehículo
✅ Consulta: SOAT vigente
✅ Consulta: revisión técnica vigente
✅ Output: semáforo VERDE/AMARILLO/ROJO + detalle
✅ UI: Streamlit funcionando
```

Con eso es suficiente para ganar. Todo lo demás es bonus.

---

## Script de demo para pitch

1. "Voy a tomar un taxi — saco el celular, fotografío la placa"
2. [foto placa → OCR → resultado en 5 segundos]
3. "El sistema consulta MTC, SOAT y revisión técnica en tiempo real"
4. "Este taxi tiene SOAT vencido — 🔴 no subo"
5. "El conductor puede tener su propio QR para mostrar que está al día"
6. "Y si voy a comprar un auto, subo el contrato y me dice si hay problemas"

---

## Casos de prueba

Buscar placas reales con problemas conocidos para demo:
- Vehículo con SOAT vencido
- Vehículo con revisión técnica vencida
- Vehículo con multas pendientes

Fuentes para encontrar casos: notas de prensa PNP, intervenciones ATU.

---

## Dependencias

```
streamlit
easyocr
requests
beautifulsoup4
playwright
pillow
qrcode[pil]
anthropic          # Claude API (opcional)
python-dotenv
```

---

## Variables de entorno (.env)

```
PLACA_API_KEY=
APIPERU_KEY=
ANTHROPIC_API_KEY=    # opcional
LATINFO_KEY=          # opcional
APP_SECRET=           # para hash de reportes
```
