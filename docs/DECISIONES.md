# Decisiones de arquitectura (ADR) — SubeSeguro

Registro breve de decisiones y su porqué. Formato: contexto → decisión → consecuencia.

---

## ADR-1 — json.pe como proveedor único de datos

**Contexto:** los datos oficiales (SOAT/APESEG, placa/SUTRAN, licencia/MTC) están dispersos en portales con scraping frágil. json.pe los reúne tras un solo Bearer token, plan gratis de 100 créditos.

**Decisión:** json.pe es la fuente PRINCIPAL. El scraping (APESEG, MTC CITV) queda como **fallback** solo cuando json.pe no trae un dato.

**Consecuencia:** un solo punto de integración, construible en poco tiempo. Riesgo: dependencia de un proveedor y de sus shapes no documentados → mitigado por ADR-2.

---

## ADR-2 — Adapter como cortafuegos del proveedor

**Contexto:** no tenemos docs de los shapes de respuesta de json.pe (solo token).

**Decisión:** todo el parseo de json.pe vive en `clients/jsonpe.py` y se normaliza a modelos internos (`SoatInfo`, `VehiculoInfo`, `LicenciaInfo`). Un script (`scripts/probe_jsonpe.py`) verifica los shapes contra la API en vivo antes de que el resto del código confíe en ellos.

**Consecuencia:** si json.pe cambia un campo, se toca un solo archivo. El resto del backend nunca ve JSON crudo del proveedor.

---

## ADR-3 — Veredicto = peor de las señales

**Contexto:** el usuario necesita una respuesta binaria de seguridad en 5 segundos, no un puntaje matizado.

**Decisión:** el color final es el **peor** de los checks (rojo > ámbar > verde). Una señal desconocida o con error cuenta como **ámbar**, nunca verde.

**Consecuencia:** conservador por diseño — preferimos un falso ámbar a un falso verde. Simple de explicar al jurado y al usuario.

---

## ADR-4 — Sin persistencia de datos de vehículo

**Contexto:** principio del proyecto: "el Estado es la fuente, no nosotros".

**Decisión:** el backend no guarda datos de vehículos en disco. Solo un cache **en memoria** con TTL por placa. Cada dato muestra fuente + timestamp.

**Consecuencia:** no hay base de datos que mantener ni que filtre datos. El QR de conductor re-consulta en tiempo real al escanear.

---

## ADR-5 — Stack Expo (mobile) + FastAPI (backend)

**Contexto:** demo mobile-first creíble ante el jurado, con backend que esconde el token y cachea.

**Decisión:** Expo (React Native + TypeScript) para el cliente; FastAPI para el proxy delgado. (Se descartó Streamlit del plan original por no ser mobile-native.)

**Consecuencia:** dos subsistemas independientes y testeables por separado. Más setup que Streamlit, mejor experiencia móvil.

---

## ADR-6 — Features diferidas a planes aparte

**Contexto:** algunas verificaciones requieren portal en vivo con CAPTCHA o un modelo ML, incompatibles con TDD sin placeholders.

**Decisión:** se difieren (no se descartan) a planes propios:
- SUNARP gravámenes / Alerta Robo (Playwright + CAPTCHA, sin fixture estable)
- SAT Lima multas
- latinfo.dev KYB empresa vendedora
- Detección visual de placa clonada (YOLOv8 / CLIP)

**Consecuencia:** el MVP entrega pasajero + comprador (con contrato) + conductor con TDD limpio. Lo diferido queda documentado, no olvidado.
