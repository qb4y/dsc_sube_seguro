import React from 'react';
import { Check, X, type LucideIcon } from 'lucide-react';
import { tokens } from '../../tokens';

export interface ChoiceButtonProps {
  active: boolean;
  /** Hex color for the active state */
  color: string;
  /** Lucide icon component */
  Icon?: LucideIcon;
  label: string;
  onClick?: () => void;
}

export function ChoiceButton({ active, color, Icon = Check, label, onClick }: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '11px 10px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 13.5,
        background: active ? color + '22' : tokens.colorSurfaceElevated,
        border: `1.5px solid ${active ? color : tokens.colorLine}`,
        color: active ? color : tokens.colorText,
        transition: 'all .12s',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <Icon size={17} /> {label}
    </button>
  );
}

/** Convenience pair: Sí / No match confirmation */
export interface MatchConfirmProps {
  match: boolean | null;
  onMatch: (value: boolean) => void;
}

export function MatchConfirm({ match, onMatch }: MatchConfirmProps) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <ChoiceButton active={match === true}  color={tokens.colorSuccess} Icon={Check} label="Sí, coincide" onClick={() => onMatch(true)}  />
      <ChoiceButton active={match === false} color={tokens.colorDanger}  Icon={X}     label="No coincide"  onClick={() => onMatch(false)} />
    </div>
  );
}

export default ChoiceButton;
