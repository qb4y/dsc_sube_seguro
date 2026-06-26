StatusRow from subeseguro-ds. Use via `window.SubeSeguroDS.StatusRow` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatusRowProps {
  verdict: "green" | "amber" | "red";
  title: string;
  /** Primary status label (e.g. "VIGENTE", "VENCIDO") */
  big: string;
  /** Secondary line (e.g. insurer name) */
  sub?: string;
  /** Explanatory note */
  note?: string;
}
```
