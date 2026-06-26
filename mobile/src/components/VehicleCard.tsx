import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens, verdictColors, radius, type } from '../lib/tokens';
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
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="car" size={18} color={tokens.colorBrand} />
        </View>
        <Text style={styles.headerTitle}>Datos del vehículo</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Marca</Text>
        <Text style={styles.detailValue}>{vehicle.marca || '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Modelo</Text>
        <Text style={styles.detailValue}>{vehicle.modelo || '—'}</Text>
      </View>
      <View style={[styles.detailRow, styles.lastDetail]}>
        <Text style={styles.detailLabel}>Color</Text>
        <Text style={styles.detailValue}>{vehicle.color || '—'}</Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.question}>¿Coincide con el vehículo que ves?</Text>
      <MatchConfirm value={match} onChange={onMatch} />

      {match === false && (
        <View style={styles.alert}>
          <Ionicons name="warning" size={16} color={verdictColors.red} style={{ marginTop: 1 }} />
          <Text style={styles.alertText}>
            Vehículo no coincide con datos registrados. Podría ser placa clonada.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colorSurface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: tokens.colorBrandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...type.headline,
    color: tokens.colorText,
  },
  separator: {
    height: 0.5,
    backgroundColor: tokens.colorLine,
    marginHorizontal: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colorLine,
  },
  lastDetail: { borderBottomWidth: 0 },
  detailLabel: {
    ...type.subheadline,
    color: tokens.colorTextSecondary,
  },
  detailValue: {
    ...type.subheadline,
    color: tokens.colorText,
    fontWeight: '600',
  },
  question: {
    ...type.footnote,
    color: tokens.colorTextMuted,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  alert: {
    flexDirection: 'row',
    gap: 8,
    margin: 16,
    marginTop: 8,
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,69,58,0.3)',
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'flex-start',
  },
  alertText: {
    flex: 1,
    ...type.footnote,
    color: verdictColors.red,
    lineHeight: 19,
  },
});
