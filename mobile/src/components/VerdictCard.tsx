import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  tokens, verdictColors, verdictTints, verdictBorders, verdictLabels,
  spacing, radius, type, fontMono, type VerdictColor,
} from '../lib/tokens';

export interface VerdictCardProps {
  verdict: VerdictColor;
  placa: string;
}

const ICONS: Record<VerdictColor, keyof typeof Ionicons.glyphMap> = {
  green: 'shield-checkmark',
  amber: 'warning',
  red:   'ban',
};

const SUBTITLES: Record<VerdictColor, string> = {
  green: 'Documentación al día',
  amber: 'Revisar observaciones',
  red:   'No recomendado',
};

export function VerdictCard({ verdict, placa }: VerdictCardProps) {
  const color = verdictColors[verdict];
  const tint = verdictTints[verdict];
  const border = verdictBorders[verdict];

  return (
    <View testID="verdict-card" style={[styles.card, { backgroundColor: tint, borderColor: border }]}>
      <View style={[styles.iconRing, { backgroundColor: tint, borderColor: border }]}>
        <Ionicons name={ICONS[verdict]} size={32} color={color} />
      </View>
      <Text style={[styles.label, { color }]}>{verdictLabels[verdict]}</Text>
      <Text style={styles.subtitle}>{SUBTITLES[verdict]}</Text>
      <View style={[styles.placaPill, { borderColor: border }]}>
        <Text style={[styles.placa, { color: tokens.colorTextSecondary }]}>{placa}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...type.title1,
    marginBottom: 4,
  },
  subtitle: {
    ...type.subheadline,
    color: tokens.colorTextSecondary,
    marginBottom: spacing.md,
  },
  placaPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  placa: {
    fontSize: 17,
    fontFamily: fontMono,
    letterSpacing: 4,
    fontWeight: '600',
  },
});
