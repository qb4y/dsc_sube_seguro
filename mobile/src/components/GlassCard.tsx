import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { radius } from '../lib/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** expo-blur intensity 0–100. Default 55. */
  intensity?: number;
  /** Optional rgba color tint over the blur. */
  tintColor?: string;
  /** Override border radius. */
  borderRadius?: number;
}

/**
 * Liquid glass surface: BlurView + specular highlight layers.
 * Top edge bright (refraction), bottom edge dark (shadow), glass fill.
 */
export function GlassCard({
  children,
  style,
  intensity = 55,
  tintColor = 'rgba(28,28,30,0.52)',
  borderRadius: br = radius.xl,
}: GlassCardProps) {
  return (
    <View style={[styles.container, { borderRadius: br }, style]}>
      {/* Blur layer */}
      <BlurView
        intensity={intensity}
        tint="systemChromeMaterialDark"
        style={[StyleSheet.absoluteFill, { borderRadius: br }]}
      />

      {/* Glass color fill */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor, borderRadius: br }]} />

      {/* Specular highlight — top edge (refraction) */}
      <View style={[styles.highlightTop, { borderRadius: br }]} />

      {/* Specular left edge */}
      <View style={[styles.highlightLeft, { borderRadius: br }]} />

      {/* Inner shadow — bottom */}
      <View style={[styles.innerShadow, { borderRadius: br }]} />

      {/* Content above all layers */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
  },
  highlightTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.32)',
    zIndex: 3,
  },
  highlightLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 3,
  },
  innerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 3,
  },
  content: {
    position: 'relative',
    zIndex: 5,
  },
});
