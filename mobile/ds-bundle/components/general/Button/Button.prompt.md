Button from subeseguro-ds. Use via `window.SubeSeguroDS.Button` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ButtonProps {
  /** Visual style */
  variant?: "primary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}
```
