import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { verdictColors, verdictTints, verdictBorders, verdictLabels, type, type VerdictColor } from '../lib/tokens';

export interface BadgeProps {
  verdict: VerdictColor;
  label?: string;
}

const ICONS: Record<VerdictColor, keyof typeof Ionicons.glyphMap> = {
  green: 'checkmark-circle',
  amber: 'warning',
  red:   'close-circle',
};

export function Badge({ verdict, label }: BadgeProps) {
  const color = verdictColors[verdict];
  const tint = verdictTints[verdict];
  const border = verdictBorders[verdict];

  return (
    <View style={[styles.pill, { backgroundColor: tint, borderColor: border }]}>
      <Ionicons name={ICONS[verdict]} size={13} color={color} />
      <Text style={[styles.label, { color }]}>{label ?? verdictLabels[verdict]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 0.5,
    gap: 5,
  },
  label: {
    ...type.caption1,
    fontWeight: '700',
  },
});
