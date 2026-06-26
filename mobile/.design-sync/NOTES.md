# SubeSeguro DS — sync notes

## Setup

- Package: `design-system/` at repo root
- Build: `cd design-system && npm run build` (esbuild + tsc)
- Node modules: `design-system/node_modules`
- Entry: `design-system/dist/index.es.js`
- Types: `design-system/dist/types/index.d.ts`
- No provider needed — all components use inline styles, no context.
- `lucide-react` is a peer dep; ships in `_vendor/` via the converter.

## Re-sync risks

- Token hex values are inlined into component styles — if tokens change, re-sync.
- `MatchConfirm` is exported from `ChoiceButton/index.tsx` — two exports from one file; converter may list both under the ChoiceButton group.
- `VehicleInfo` is an interface, not a component — should not appear in component list; exclude via `componentSrcMap` if it does.
- `tokens`, `verdictColors`, `verdictLabels` are non-component exports — exclude if they appear as components.
