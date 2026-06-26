import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';
import { tokens, verdictColors, type VerdictColor } from '../../tokens';

export interface StatusRowProps {
  verdict: VerdictColor;
  title: string;
  /** Primary status label (e.g. "VIGENTE", "VENCIDO") */
  big: string;
  /** Secondary line (e.g. insurer name) */
  sub?: string;
  /** Explanatory note */
  note?: string;
}

const icons = { green: ShieldCheck, amber: Clock, red: ShieldX };

export function StatusRow({ verdict, title, big, sub, note }: StatusRowProps) {
  const color = verdictColors[verdict];
  const Icon = icons[verdict];
  return (
    <div style={{
      borderRadius: 16, padding: 16,
      background: tokens.colorSurface, border: `1px solid ${tokens.colorLine}`,
      display: 'flex', gap: 14, alignItems: 'flex-start',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: color + '1F', display: 'grid', placeItems: 'center',
      }}>
        <Icon size={20} color={color} strokeWidth={2.4} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: tokens.colorTextMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.01em' }}>{big}</div>
        {sub  && <div style={{ fontSize: 13, color: tokens.colorTextMuted }}>{sub}</div>}
        {note && <div style={{ fontSize: 12.5, color: tokens.colorText, opacity: 0.82, marginTop: 6, lineHeight: 1.45 }}>{note}</div>}
      </div>
    </div>
  );
}

export default StatusRow;
