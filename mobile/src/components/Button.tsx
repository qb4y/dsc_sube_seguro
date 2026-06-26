import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { tokens, radius, type } from '../lib/tokens';

export interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'tinted';
  loading?: boolean;
  disabled?: boolean;
  children: string;
  onPress: () => void;
}

export function Button({ variant = 'primary', loading, disabled, children, onPress }: ButtonProps) {
  return (
    <Pressable
      testID="btn-action"
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'tinted' && styles.tinted,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator
            color={variant === 'primary' ? '#000' : tokens.colorBrand}
            size="small"
          />
          <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textAlt]}>
            Revisando…
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textAlt]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: {
    backgroundColor: tokens.colorBrand,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  ghost: {
    backgroundColor: tokens.colorSurfaceElevated,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
  },
  tinted: {
    backgroundColor: tokens.colorBrandTint,
    borderWidth: 0.5,
    borderColor: tokens.colorBrandBorder,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  text: { ...type.headline },
  textPrimary: { color: '#000000', fontWeight: '700' },
  textAlt: { color: tokens.colorBrand },
});
