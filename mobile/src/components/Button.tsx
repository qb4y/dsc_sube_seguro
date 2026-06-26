/**
 * React Native adaptation of design-system Button.
 * Matches DS props: variant, loading, disabled, children, onClick→onPress
 */
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { tokens, radius } from '../lib/tokens';

export interface ButtonProps {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  children: string;
  onPress: () => void;
}

export function Button({ variant = 'primary', loading, disabled, children, onPress }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      testID="btn-action"
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <ActivityIndicator color={isPrimary ? tokens.colorBackground : tokens.colorText} size="small" />
          <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>
            Revisando…
          </Text>
        </>
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    gap: 8,
  },
  primary: { backgroundColor: tokens.colorBrand },
  ghost: { backgroundColor: tokens.colorSurfaceElevated },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '800' },
  textPrimary: { color: tokens.colorBackground },
  textGhost: { color: tokens.colorText },
});
