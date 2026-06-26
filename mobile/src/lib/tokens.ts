export const tokens = {
  // Backgrounds — iOS 26 dark system
  colorBackground:      '#000000',
  colorBG2:             '#1C1C1E',
  colorBG3:             '#2C2C2E',
  colorSurface:         '#1C1C1E',
  colorSurfaceElevated: '#2C2C2E',
  colorSurfaceGlass:    'rgba(28,28,30,0.78)',
  colorSurfaceGlass2:   'rgba(44,44,46,0.72)',

  // Separators
  colorLine:     'rgba(84,84,88,0.65)',
  colorLineSolid: '#3A3A3C',

  // Labels — iOS semantic
  colorText:          '#FFFFFF',
  colorTextSecondary: 'rgba(235,235,245,0.6)',
  colorTextMuted:     'rgba(235,235,245,0.3)',
  colorTextQuaternary:'rgba(235,235,245,0.18)',

  // Accent
  colorBrand:      '#2FD6C6',
  colorBrandTint:  'rgba(47,214,198,0.14)',
  colorBrandBorder:'rgba(47,214,198,0.28)',

  // Semantic — iOS 26 precise
  colorSuccess:      '#30D158',
  colorSuccessTint:  'rgba(48,209,88,0.14)',
  colorWarning:      '#FFD60A',
  colorWarningTint:  'rgba(255,214,10,0.14)',
  colorDanger:       '#FF453A',
  colorDangerTint:   'rgba(255,69,58,0.14)',

  // Special
  colorPlateSidebar: '#003DA5',
  colorWhatsApp:     '#25D366',
} as const;

export type VerdictColor = 'green' | 'amber' | 'red';

export const verdictColors: Record<VerdictColor, string> = {
  green: tokens.colorSuccess,
  amber: tokens.colorWarning,
  red:   tokens.colorDanger,
};

export const verdictTints: Record<VerdictColor, string> = {
  green: tokens.colorSuccessTint,
  amber: tokens.colorWarningTint,
  red:   tokens.colorDangerTint,
};

export const verdictBorders: Record<VerdictColor, string> = {
  green: 'rgba(48,209,88,0.28)',
  amber: 'rgba(255,214,10,0.28)',
  red:   'rgba(255,69,58,0.28)',
};

export const verdictLabels: Record<VerdictColor, string> = {
  green: 'Seguro',
  amber: 'Precaución',
  red:   'Riesgo',
};

// Spacing — 8pt grid
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  20,
  xl:  28,
  xxl: 44,
} as const;

// Radius — iOS superellipse
export const radius = {
  xs:   6,
  sm:   10,
  md:   13,
  lg:   16,
  xl:   20,
  xxl:  28,
  pill: 999,
} as const;

// Typography scale — SF Pro
export const type = {
  largeTitle:   { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.37 },
  title1:       { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.36 },
  title2:       { fontSize: 22, fontWeight: '700' as const, letterSpacing: 0.35 },
  title3:       { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0.38 },
  headline:     { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.41 },
  body:         { fontSize: 17, fontWeight: '400' as const, letterSpacing: -0.41 },
  callout:      { fontSize: 16, fontWeight: '400' as const, letterSpacing: -0.32 },
  subheadline:  { fontSize: 15, fontWeight: '400' as const, letterSpacing: -0.24 },
  footnote:     { fontSize: 13, fontWeight: '400' as const, letterSpacing: -0.08 },
  caption1:     { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0 },
  caption2:     { fontSize: 11, fontWeight: '400' as const, letterSpacing: 0.07 },
} as const;

export const fontMono = 'monospace';
export const colorPlateBlueSidebar = tokens.colorPlateSidebar;
export const colorWhatsApp = tokens.colorWhatsApp;
