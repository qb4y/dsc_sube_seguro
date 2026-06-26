import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens, verdictColors, verdictTints, verdictLabels, radius, type, type VerdictColor } from '../lib/tokens';

export interface StatusRowProps {
  verdict: VerdictColor;
  title: string;
  big: string;
  sub?: string;
  note?: string;
}

const ICONS: Record<VerdictColor, keyof typeof Ionicons.glyphMap> = {
  green: 'checkmark-circle',
  amber: 'time',
  red:   'close-circle',
};

export function StatusRow({ verdict, title, big, sub, note }: StatusRowProps) {
  const color = verdictColors[verdict];
  const tint = verdictTints[verdict];

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: tint }]}>
        <Ionicons name={ICONS[verdict]} size={20} color={color} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.big, { color }]}>{big}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
        {note && <Text style={styles.note}>{note}</Text>}
      </View>

      <View style={[styles.badge, { backgroundColor: tint }]}>
        <Text style={[styles.badgeText, { color }]}>{verdictLabels[verdict]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colorSurface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colorLine,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
  title: {
    ...type.caption1,
    color: tokens.colorTextMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginBottom: 2,
  },
  big: {
    ...type.subheadline,
    fontWeight: '600',
  },
  sub: {
    ...type.caption1,
    color: tokens.colorTextSecondary,
    marginTop: 2,
  },
  note: {
    ...type.caption2,
    color: tokens.colorTextMuted,
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  badgeText: {
    ...type.caption1,
    fontWeight: '700',
  },
});
