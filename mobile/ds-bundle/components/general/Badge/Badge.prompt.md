Badge from subeseguro-ds. Use via `window.SubeSeguroDS.Badge` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface BadgeProps {
  /** Traffic-light verdict */
  verdict: "green" | "amber" | "red";
  /** Override the default label (Seguro / Precaución / Riesgo) */
  label?: string;
}
```
