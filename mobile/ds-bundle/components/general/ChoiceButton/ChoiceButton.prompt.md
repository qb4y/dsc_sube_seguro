ChoiceButton from subeseguro-ds. Use via `window.SubeSeguroDS.ChoiceButton` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ChoiceButtonProps {
  active: boolean;
  /** Hex color for the active state */
  color: string;
  /** Lucide icon component */
  Icon?: LucideIcon;
  label: string;
  onClick?: () => void;
}
```
