import React from 'react';
import { ScanLine } from 'lucide-react';
import { tokens } from '../../tokens';

export interface ButtonProps {
  /** Visual style */
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', loading, disabled, children, onClick }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={!!inactive}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 20px', borderRadius: 14, border: 'none', cursor: inactive ? 'not-allowed' : 'pointer',
        background: isPrimary
          ? (inactive ? tokens.colorSurfaceElevated : tokens.colorBrand)
          : tokens.colorSurfaceElevated,
        color: isPrimary
          ? (inactive ? tokens.colorTextMuted : tokens.colorBackground)
          : tokens.colorText,
        fontWeight: 800, fontSize: 15,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        transition: 'background .15s',
        width: '100%',
      }}
    >
      {loading ? <><ScanLine size={18} /> Revisando…</> : children}
    </button>
  );
}

export default Button;
