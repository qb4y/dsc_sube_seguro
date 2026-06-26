VehicleCard from subeseguro-ds. Use via `window.SubeSeguroDS.VehicleCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface VehicleCardProps {
  vehicle: VehicleInfo;
  /** null = no answer yet, true = matches, false = mismatch */
  match: boolean;
  onMatch: (value: boolean) => void;
}
```
