/**
 * React Native adaptation of design-system VerdictCard.
 * Matches DS props: verdict, placa
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens, verdictColors, verdictLabels, spacing, radius, fontMono, type VerdictColor } from '../lib/tokens';

export interface VerdictCardProps {
  verdict: VerdictColor;
  placa: string;
}

const ICONS: Record<VerdictColor, string> = {
  green: '🛡️',
  amber: '⚠️',
  red: '🚫',
};

export function VerdictCard({ verdict, placa }: VerdictCardProps) {
  const color = verdictColors[verdict];
  return (
    <View testID="verdict-card" style={[styles.card, { backgroundColor: color + '14' }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Text style={styles.icon}>{ICONS[verdict]}</Text>
      </View>
      <Text style={[styles.label, { color }]}>{verdictLabels[verdict]}</Text>
      <Text style={styles.placa}>{placa}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 28 },
  label: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  placa: {
    fontSize: 18,
    fontFamily: fontMono,
    color: tokens.colorTextMuted,
    letterSpacing: 3,
    marginTop: 4,
  },
});
