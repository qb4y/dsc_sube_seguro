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
