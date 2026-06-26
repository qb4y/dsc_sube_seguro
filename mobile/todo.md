# SubeSeguro Mobile — TODO por fases

---

## Fase 0 — Setup del proyecto

- [x] Crear proyecto Expo con `create-expo-app` (blank-typescript)
- [x] Instalar dependencias: `expo-router`, `expo-camera`, `expo-image-picker`, `expo-linking`, `axios`
- [x] Configurar jest + `@testing-library/react-native`
- [x] Configurar `expo-router` como entry point + scheme en `app.json`
- [x] Crear `.env.example` con `EXPO_PUBLIC_API_URL`
- [x] Smoke test (`jest runs`)

---

## Fase 1 — Lógica pura (sin UI, testeable sin device)

- [x] `src/lib/tokens.ts` — Design tokens sincronizados con `design-system/src/tokens.ts`
- [x] `src/lib/colores.ts` — Type `Color` + `estilo()` + `toVerdict()` (bridge backend→DS)
- [x] `src/lib/whatsapp.ts` — `construirMensaje()` + `urlWhatsapp()`
- [x] Tests para colores + whatsapp

---

## Fase 2 — API client tipado

- [x] `src/api/client.ts` — axios instance con `EXPO_PUBLIC_API_URL`
- [x] `src/api/verificar.ts` — Tipos `Check`, `Veredicto` + `verificarPasajero()`, `crearQrConductor()`
- [x] `src/api/ocr.ts` — `ocrPlaca()` multipart upload
- [x] Tests para verificar (mock axios)
- [ ] Test para ocr (mock axios)

---

## Fase 3 — Componentes UI (Design System → React Native)

Cada componente RN replica las props del DS web (`design-system/src/components/`).

- [x] `PlateInput` — Input estilo placa peruana (sidebar azul PE, monospace, auto-uppercase)
- [x] `VerdictCard` — Banner con icono + color de veredicto + placa
- [x] `StatusRow` — Card dark con icono, título, detalle, fuente (props: `verdict, title, big, sub, note`)
- [x] `CheckList` — Lista de StatusRows desde `Check[]` del backend
- [x] `VehicleCard` — Datos del vehículo + MatchConfirm (Sí/No match visual)
- [x] `ShareButton` — Botón WhatsApp "Comparte tu viaje" (verde → surface tras share)
- [x] `Badge` — Pill con icono shield según veredicto
- [x] `Button` — Primary (brand) / Ghost / Loading state ("Revisando…")
- [x] `ChoiceButton` + `MatchConfirm` — Toggle Sí/No para confirmación visual
- [ ] Tests de render para componentes (Semaforo, CheckList, etc.)

---

## Fase 4 — Pantallas (wiring)

- [x] `app/_layout.tsx` — Tab layout con 3 pestañas + dark theme
- [x] `app/index.tsx` — **Pasajero**: PlateInput → Verificar → VerdictCard + CheckList + VehicleCard + ShareButton + botón cámara OCR
- [x] `app/comprador.tsx` — **Comprador**: PlateInput → Verificar → VerdictCard + CheckList
- [x] `app/conductor.tsx` — **Conductor**: PlateInput + DNI → Generar QR → Mostrar imagen QR
- [ ] Integrar upload de contrato en Comprador (PDF/foto → Claude API)
- [ ] Pantalla de resultado de análisis de contrato (alertas + resumen)

---

## Fase 5 — Polish y UX

- [ ] Iconos reales en tabs (reemplazar emojis por iconos de librería)
- [ ] Loading state con animación scan-line en PlateInput
- [ ] Error handling visual mejorado (toast o snackbar)
- [ ] Animaciones de transición entre estados (sin resultado → cargando → resultado)
- [ ] Haptic feedback al obtener veredicto
- [ ] Empty state cuando no hay resultados

---

## Fase 6 — Testing completo

- [ ] Tests de render para cada componente (`@testing-library/react-native`)
- [ ] Tests de integración para pantalla Pasajero (mock API → render completo)
- [ ] Tests de integración para pantalla Conductor
- [ ] Test E2E con Detox o Maestro (opcional)

---

## Fase 7 — Preparación para demo / producción

- [ ] Test manual completo en Expo Go / dispositivo físico contra backend real
- [ ] Verificar flujo completo: placa → veredicto → compartir WhatsApp
- [ ] Verificar flujo conductor: placa + DNI → QR → escaneo re-consulta
- [ ] Verificar flujo cámara: foto → OCR → autocompletar placa
- [ ] Grabar video de backup para demo
- [ ] App icon y splash screen personalizados
- [ ] Configurar EAS Build para APK/IPA si se necesita

---

## Alineación con Design System

Los componentes mobile replican las **mismas interfaces** del DS web:

| DS web (React) | Mobile (React Native) | Props match |
|----------------|----------------------|-------------|
| `Badge` | `Badge.tsx` | `verdict, label?` |
| `Button` | `Button.tsx` | `variant, loading, disabled, children` |
| `ChoiceButton` | `ChoiceButton.tsx` | `active, color, label` |
| `MatchConfirm` | `ChoiceButton.tsx` | `value, onChange` |
| `PlateInput` | `PlateInput.tsx` | `value, onChange, onSubmit?, loading?` |
| `ShareButton` | `ShareButton.tsx` | adaptado para WhatsApp nativo |
| `StatusRow` | `StatusRow.tsx` | `verdict, title, big, sub?, note?` |
| `VerdictCard` | `VerdictCard.tsx` | `verdict, placa` |
| `VehicleCard` | `VehicleCard.tsx` | `vehicle, match, onMatch` |

Los tokens (`tokens.ts`) usan los mismos hex values que `design-system/src/tokens.ts`.
