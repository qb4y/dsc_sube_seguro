import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
  tokens, verdictColors, verdictBorders, verdictLabels,
  radius, type, fontMono, type VerdictColor,
} from '../lib/tokens';
import { useScaleBounce } from '../lib/animations';

export interface VerdictCardProps {
  verdict: VerdictColor;
  placa: string;
}

const ICONS: Record<VerdictColor, keyof typeof Ionicons.glyphMap> = {
  green: 'shield-checkmark',
  amber: 'warning',
  red:   'ban',
};

const SUBTITLES: Record<VerdictColor, string> = {
  green: 'Documentación al día',
  amber: 'Revisar observaciones',
  red:   'No recomendado',
};

const TINTS: Record<VerdictColor, string> = {
  green: 'rgba(48,209,88,0.12)',
  amber: 'rgba(255,214,10,0.10)',
  red:   'rgba(255,69,58,0.12)',
};

export function VerdictCard({ verdict, placa }: VerdictCardProps) {
  const color = verdictColors[verdict];
  const border = verdictBorders[verdict];
  const { scale, opacity } = useScaleBounce(true);

  return (
    <Animated.View
      testID="verdict-card"
      style={[styles.outer, { transform: [{ scale }], opacity }]}
    >
      {/* Blur backdrop */}
      <BlurView
        intensity={60}
        tint="systemChromeMaterialDark"
        style={[StyleSheet.absoluteFill, { borderRadius: radius.xxl }]}
      />

      {/* Color tint overlay */}
      <View style={[StyleSheet.absoluteFill, styles.tintLayer, { backgroundColor: TINTS[verdict], borderRadius: radius.xxl }]} />

      {/* Specular top highlight */}
      <View style={[styles.specularTop, { borderColor: border }]} />

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.iconRing, { backgroundColor: TINTS[verdict], borderColor: border }]}>
          <Ionicons name={ICONS[verdict]} size={34} color={color} />
        </View>

        <Text style={[styles.label, { color }]}>{verdictLabels[verdict]}</Text>
        <Text style={styles.subtitle}>{SUBTITLES[verdict]}</Text>

        <View style={[styles.placaPill, { borderColor: border }]}>
          <Text style={[styles.placa, { color: tokens.colorTextSecondary }]}>{placa}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.xxl,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
  },
  tintLayer: {},
  specularTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 0,
    zIndex: 2,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    zIndex: 5,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  label: {
    ...type.title1,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...type.subheadline,
    color: tokens.colorTextSecondary,
    marginBottom: 16,
  },
  placaPill: {
    borderWidth: 0.5,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  placa: {
    fontSize: 18,
    fontFamily: fontMono,
    letterSpacing: 5,
    fontWeight: '600',
  },
});
