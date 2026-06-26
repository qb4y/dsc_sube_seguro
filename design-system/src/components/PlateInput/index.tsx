import React from 'react';
import { tokens } from '../../tokens';

export interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function PlateInput({ value, onChange, onSubmit, loading, placeholder = 'ABC-123' }: PlateInputProps) {
  return (
    <div style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden',
      border: `2px solid ${tokens.colorLine}`, display: 'flex',
      background: '#F3F4F0',
    }}>
      <div style={{
        width: 38, background: '#1B4FA0', display: 'grid', placeItems: 'center',
        color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1, flexShrink: 0,
      }}>
        PE
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value.toUpperCase().slice(0, 8))}
        onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
        aria-label="Placa del vehículo"
        style={{
          flex: 1, border: 'none', background: 'transparent', padding: '16px 14px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 26, fontWeight: 800, letterSpacing: '0.14em',
          color: '#15171C', outline: 'none',
        }}
      />
      {loading && (
        <div style={{
          position: 'absolute', left: 38, right: 0, top: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${tokens.colorBrand}, transparent)`,
          animation: 'scan 1.1s linear infinite',
        }} />
      )}
      <style>{`@keyframes scan { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  );
}

export default PlateInput;
