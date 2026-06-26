import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { radius } from '../lib/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** rgba color for the glass fill. Default: dark glass. */
  tintColor?: string;
  borderRadius?: number;
}

/**
 * Liquid glass card — pure React Native, no native modules.
 * Layered rgba surfaces + specular highlights simulate glass refraction.
 */
export function GlassCard({
  children,
  style,
  tintColor = 'rgba(28,28,30,0.88)',
  borderRadius: br = radius.xl,
}: GlassCardProps) {
  return (
    <View style={[styles.container, { borderRadius: br }, style]}>
      {/* Glass fill */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor, borderRadius: br }]} />

      {/* Inner noise texture layer */}
      <View style={[StyleSheet.absoluteFill, styles.noiseLayer, { borderRadius: br }]} />

      {/* Specular highlight — top edge (refraction) */}
      <View style={[styles.highlightTop, { borderTopLeftRadius: br, borderTopRightRadius: br }]} />

      {/* Specular — left edge */}
      <View style={[styles.highlightLeft, { borderTopLeftRadius: br, borderBottomLeftRadius: br }]} />

      {/* Inner shadow — bottom */}
      <View style={[styles.innerShadowBottom, { borderBottomLeftRadius: br, borderBottomRightRadius: br }]} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 16,
  },
  noiseLayer: {
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  highlightTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    zIndex: 3,
  },
  highlightLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    zIndex: 3,
  },
  innerShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
    zIndex: 3,
  },
  content: {
    position: 'relative',
    zIndex: 5,
  },
});
