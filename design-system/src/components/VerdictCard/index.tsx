import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { tokens, verdictColors, verdictLabels, type VerdictColor } from '../../tokens';

export interface VerdictCardProps {
  verdict: VerdictColor;
  /** Vehicle plate number */
  placa: string;
}

const icons = { green: ShieldCheck, amber: ShieldAlert, red: ShieldX };

export function VerdictCard({ verdict, placa }: VerdictCardProps) {
  const color = verdictColors[verdict];
  const Icon = icons[verdict];
  return (
    <div style={{
      borderRadius: 18, padding: 18,
      background: color + '14', border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: color + '22', display: 'grid', placeItems: 'center',
      }}>
        <Icon size={28} color={color} strokeWidth={2.4} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: tokens.colorTextMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Veredicto</div>
        <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{verdictLabels[verdict]}</div>
      </div>
      <div style={{ marginLeft: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: 13, color: tokens.colorTextMuted, fontWeight: 700 }}>
        {placa}
      </div>
    </div>
  );
}

export default VerdictCard;
