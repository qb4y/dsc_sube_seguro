/**
 * React Native adaptation of design-system VehicleCard.
 * Matches DS props: vehicle (VehicleInfo), match, onMatch
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens, verdictColors, spacing, radius } from '../lib/tokens';
import { MatchConfirm } from './ChoiceButton';

export interface VehicleInfo {
  marca: string;
  modelo: string;
  color: string;
}

export interface VehicleCardProps {
  vehicle: VehicleInfo;
  match: boolean | null;
  onMatch: (v: boolean) => void;
}

export function VehicleCard({ vehicle, match, onMatch }: VehicleCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🚗 Datos del vehículo</Text>
      <Text style={styles.info}>
        {vehicle.marca} {vehicle.modelo} · {vehicle.color}
      </Text>

      <Text style={styles.question}>¿Coincide con el vehículo que ves?</Text>
      <MatchConfirm value={match} onChange={onMatch} />

      {match === false && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            ⚠️ El vehículo no coincide con los datos registrados. Podría ser placa clonada.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colorSurface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    marginBottom: spacing.sm,
  },
  title: { fontSize: 15, fontWeight: '600', color: tokens.colorText },
  info: { fontSize: 14, color: tokens.colorTextMuted, marginTop: 4 },
  question: { fontSize: 13, color: tokens.colorTextMuted, marginTop: 12, marginBottom: 8 },
  alert: {
    backgroundColor: verdictColors.red + '15',
    padding: 12,
    borderRadius: radius.sm,
    marginTop: 10,
  },
  alertText: { fontSize: 13, color: verdictColors.red, lineHeight: 19 },
});
