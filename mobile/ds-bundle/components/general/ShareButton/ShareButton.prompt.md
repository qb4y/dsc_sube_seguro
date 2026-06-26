ShareButton from subeseguro-ds. Use via `window.SubeSeguroDS.ShareButton` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ShareButtonProps {
  /** WhatsApp share URL */
  shareUrl: string;
  /** Whether the user has already shared */
  shared?: boolean;
  onClick?: () => void;
}
```
