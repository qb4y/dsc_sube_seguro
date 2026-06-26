/**
 * React Native adaptation of design-system ChoiceButton + MatchConfirm.
 * Matches DS props: active, color, label, onClick→onPress
 */
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { tokens, radius, verdictColors } from '../lib/tokens';

export interface ChoiceButtonProps {
  active: boolean;
  color: string;
  label: string;
  onPress?: () => void;
}

export function ChoiceButton({ active, color, label, onPress }: ChoiceButtonProps) {
  return (
    <Pressable
      style={[
        styles.btn,
        active && { backgroundColor: color + '22', borderColor: color },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

export interface MatchConfirmProps {
  value: boolean | null;
  onChange: (v: boolean) => void;
}

export function MatchConfirm({ value, onChange }: MatchConfirmProps) {
  return (
    <View style={styles.row}>
      <ChoiceButton
        active={value === true}
        color={verdictColors.green}
        label="✓ Sí"
        onPress={() => onChange(true)}
      />
      <ChoiceButton
        active={value === false}
        color={verdictColors.red}
        label="✕ No"
        onPress={() => onChange(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    backgroundColor: tokens.colorSurfaceElevated,
    alignItems: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', color: tokens.colorText },
  row: { flexDirection: 'row', gap: 10 },
});
