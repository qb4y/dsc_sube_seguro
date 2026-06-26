import React from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { tokens, radius, type } from '../lib/tokens';
import { useSpringPress } from '../lib/animations';

export interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'tinted';
  loading?: boolean;
  disabled?: boolean;
  children: string;
  onPress: () => void;
}

export function Button({ variant = 'primary', loading, disabled, children, onPress }: ButtonProps) {
  const { scale, onPressIn, onPressOut } = useSpringPress();
  const isPrimary = variant === 'primary';
  const isTinted = variant === 'tinted';

  return (
    <Pressable
      testID="btn-action"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          isPrimary && styles.primary,
          isTinted && styles.tinted,
          !isPrimary && !isTinted && styles.ghost,
          (disabled || loading) && styles.disabled,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator color={isPrimary ? '#000' : tokens.colorBrand} size="small" />
            <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textAlt]}>
              Revisando…
            </Text>
          </View>
        ) : (
          <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textAlt]}>
            {children}
          </Text>
        )}
      </Animated.View>
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
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
  disabled: { opacity: 0.42 },
  text: { ...type.headline },
  textPrimary: { color: '#000000', fontWeight: '700' },
  textAlt: { color: tokens.colorBrand },
});
