# SubeSeguro — Mobile

App React Native (Expo) que verifica vehículos con datos del Estado peruano.
Consume el backend FastAPI y presenta un veredicto semáforo.

Componentes alineados al [design-system](../design-system/) (mismos tokens, mismas props).

---

## Estructura

```
mobile/
├── app/                          # Pantallas (expo-router)
│   ├── _layout.tsx               # Tab navigator dark theme
│   ├── index.tsx                 # Pasajero
│   ├── comprador.tsx             # Comprador
│   └── conductor.tsx             # Conductor
├── src/
│   ├── api/                      # Comunicación con backend
│   │   ├── client.ts             # axios instance
│   │   ├── verificar.ts          # tipos Check/Veredicto + calls
│   │   └── ocr.ts                # upload foto → candidatas
│   ├── lib/                      # Lógica pura
│   │   ├── tokens.ts             # Design tokens (sync con DS)
│   │   ├── colores.ts            # Color→VerdictColor bridge
│   │   └── whatsapp.ts           # Mensaje + URL builder
│   └── components/               # Componentes RN (props = DS web)
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── CheckList.tsx
│       ├── ChoiceButton.tsx       # + MatchConfirm
│       ├── PlateInput.tsx
│       ├── ShareButton.tsx
│       ├── StatusRow.tsx
│       ├── VehicleCard.tsx
│       └── VerdictCard.tsx
├── __tests__/                    # Jest tests
├── assets/                       # Iconos, splash
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example
```

---

## Cómo correr

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<tu-IP-LAN>:8000 npx expo start
```

Requiere el backend corriendo en `http://<IP>:8000`. Ver [backend docs](../docs/API.md).

---

## Roadmap

Ver [todo.md](./todo.md) para el plan de fases detallado.
