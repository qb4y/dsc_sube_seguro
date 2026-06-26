/**
 * React Native adaptation of design-system StatusRow.
 * Matches DS props: verdict, title, big, sub, note
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens, verdictColors, verdictLabels, spacing, radius, type VerdictColor } from '../lib/tokens';

export interface StatusRowProps {
  verdict: VerdictColor;
  title: string;
  big: string;
  sub?: string;
  note?: string;
}

const ICONS: Record<VerdictColor, string> = {
  green: '🛡️',
  amber: '⏳',
  red: '🚫',
};

export function StatusRow({ verdict, title, big, sub, note }: StatusRowProps) {
  const color = verdictColors[verdict];
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Text style={styles.icon}>{ICONS[verdict]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.big, { color }]}>{big}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
        {note && <Text style={styles.note}>{note}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: tokens.colorSurface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  body: { flex: 1 },
  title: { fontSize: 11, fontWeight: '600', color: tokens.colorTextMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  big: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  sub: { fontSize: 13, color: tokens.colorText, marginTop: 2 },
  note: { fontSize: 11, color: tokens.colorTextMuted, marginTop: 4 },
});
