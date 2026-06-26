/**
 * Design tokens for SubeSeguro mobile.
 * Values are kept in sync with design-system/src/tokens.ts (source of truth).
 * We duplicate rather than import because the DS targets React web (inline styles)
 * and mobile targets React Native (StyleSheet) — different runtimes.
 */

export const tokens = {
  colorBackground:      '#0E1116',
  colorSurface:         '#171C24',
  colorSurfaceElevated: '#1F2630',
  colorLine:            'rgba(255,255,255,0.08)',
  colorText:            '#EAEEF5',
  colorTextMuted:       '#8B95A7',
  colorBrand:           '#2FD6C6',
  colorSuccess:         '#34D27B',
  colorWarning:         '#F4B740',
  colorDanger:          '#FF5D5D',
} as const;

export type VerdictColor = 'green' | 'amber' | 'red';

export const verdictColors: Record<VerdictColor, string> = {
  green: tokens.colorSuccess,
  amber: tokens.colorWarning,
  red:   tokens.colorDanger,
};

export const verdictLabels: Record<VerdictColor, string> = {
  green: 'Seguro',
  amber: 'Precaución',
  red:   'Riesgo',
};

// React Native extras
export const spacing = { sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16 } as const;
export const fontMono = 'monospace';
export const colorPlateBlueSidebar = '#003DA5';
export const colorWhatsApp = '#25D366';
