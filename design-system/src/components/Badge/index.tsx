import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { tokens, verdictColors, verdictLabels, type VerdictColor } from '../../tokens';

export interface BadgeProps {
  /** Traffic-light verdict */
  verdict: VerdictColor;
  /** Override the default label (Seguro / Precaución / Riesgo) */
  label?: string;
}

const icons = { green: ShieldCheck, amber: ShieldAlert, red: ShieldX };

export function Badge({ verdict, label }: BadgeProps) {
  const color = verdictColors[verdict];
  const Icon = icons[verdict];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: color + '22', border: `1px solid ${color}55`,
      color, fontSize: 13, fontWeight: 700,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <Icon size={14} strokeWidth={2.5} />
      {label ?? verdictLabels[verdict]}
    </span>
  );
}

export default Badge;
