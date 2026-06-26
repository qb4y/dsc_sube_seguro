import React from 'react';
import { Car } from 'lucide-react';
import { tokens } from '../../tokens';
import { MatchConfirm } from '../ChoiceButton';

export interface VehicleInfo {
  marca: string;
  modelo: string;
  color: string;
}

export interface VehicleCardProps {
  vehicle: VehicleInfo;
  /** null = no answer yet, true = matches, false = mismatch */
  match: boolean | null;
  onMatch: (value: boolean) => void;
}

export function VehicleCard({ vehicle, match, onMatch }: VehicleCardProps) {
  return (
    <div style={{
      borderRadius: 16, padding: 16,
      background: tokens.colorSurface, border: `1px solid ${tokens.colorLine}`,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Car size={18} color={tokens.colorTextMuted} />
        <span style={{ fontSize: 12, color: tokens.colorTextMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Vehículo registrado
        </span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: tokens.colorText }}>
        {vehicle.marca} {vehicle.modelo}
      </div>
      <div style={{ fontSize: 14, color: tokens.colorTextMuted, marginBottom: 14 }}>
        Color {vehicle.color}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: tokens.colorText }}>
        ¿El auto frente a ti es un {vehicle.marca} {vehicle.modelo} {vehicle.color.toLowerCase()}?
      </div>
      <MatchConfirm match={match} onMatch={onMatch} />
      {match === false && (
        <div style={{
          marginTop: 12, fontSize: 13, color: tokens.colorDanger,
          background: tokens.colorDanger + '12', border: `1px solid ${tokens.colorDanger}44`,
          borderRadius: 10, padding: '10px 12px', lineHeight: 1.45,
        }}>
          <b>Alerta.</b> La placa no corresponde a este auto. Podría ser una placa clonada o cambiada. No subas.
        </div>
      )}
    </div>
  );
}

export default VehicleCard;
