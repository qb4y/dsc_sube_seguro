/**
 * React Native adaptation of design-system Badge.
 * Matches DS props: verdict, label
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { verdictColors, verdictLabels, type VerdictColor } from '../lib/tokens';

export interface BadgeProps {
  verdict: VerdictColor;
  label?: string;
}

const ICONS: Record<VerdictColor, string> = {
  green: '🛡️',
  amber: '⚠️',
  red: '🚫',
};

export function Badge({ verdict, label }: BadgeProps) {
  const color = verdictColors[verdict];
  return (
    <View style={[styles.pill, { backgroundColor: color + '22' }]}>
      <Text style={styles.icon}>{ICONS[verdict]}</Text>
      <Text style={[styles.label, { color }]}>{label ?? verdictLabels[verdict]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  icon: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600' },
});
