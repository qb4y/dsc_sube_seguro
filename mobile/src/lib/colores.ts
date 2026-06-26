/**
 * Maps backend Color values (Spanish) to DS VerdictColor (English)
 * and provides styling helpers for React Native components.
 */
import { verdictColors, verdictLabels, type VerdictColor } from './tokens';

/** Backend sends colors in Spanish */
export type Color = 'verde' | 'ambar' | 'rojo' | 'desconocido';

interface Estilo {
  hex: string;
  emoji: string;
  etiqueta: string;
  verdict: VerdictColor;
}

const MAPA: Record<Color, Estilo> = {
  verde:       { hex: verdictColors.green, emoji: '🟢', etiqueta: verdictLabels.green, verdict: 'green' },
  ambar:       { hex: verdictColors.amber, emoji: '🟡', etiqueta: verdictLabels.amber, verdict: 'amber' },
  rojo:        { hex: verdictColors.red,   emoji: '🔴', etiqueta: verdictLabels.red,   verdict: 'red' },
  desconocido: { hex: verdictColors.amber, emoji: '🟡', etiqueta: verdictLabels.amber, verdict: 'amber' },
};

export function estilo(c: Color): Estilo {
  return MAPA[c] ?? MAPA.desconocido;
}

/** Convert backend Color → DS VerdictColor */
export function toVerdict(c: Color): VerdictColor {
  return estilo(c).verdict;
}
