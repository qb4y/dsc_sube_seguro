import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing } from '../lib/tokens';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={tokens.colorTextMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  title: { fontSize: 16, fontWeight: '600', color: tokens.colorTextMuted, marginTop: spacing.md, textAlign: 'center' },
  subtitle: { fontSize: 13, color: tokens.colorTextMuted, marginTop: 6, textAlign: 'center', lineHeight: 19, opacity: 0.7 },
});
