import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  tokens, verdictColors, verdictBorders, verdictLabels,
  radius, type, fontMono, type VerdictColor,
} from '../lib/tokens';
import { useScaleBounce } from '../lib/animations';

export interface VerdictCardProps {
  verdict: VerdictColor;
  placa: string;
  score?: number;
}

const ICONS: Record<VerdictColor, keyof typeof Ionicons.glyphMap> = {
  green: 'shield-checkmark',
  amber: 'warning',
  red:   'ban',
};

const TINTS: Record<VerdictColor, string> = {
  green: 'rgba(48,209,88,0.10)',
  amber: 'rgba(255,214,10,0.08)',
  red:   'rgba(255,69,58,0.10)',
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const isMax = score >= 100;
  const hint = score < 70
    ? 'Documentación incompleta'
    : score < 100
      ? 'Conductor no verificado'
      : 'Totalmente verificado';

  return (
    <View style={styles.scoreWrap}>
      {/* Outer ring */}
      <View style={[styles.ringOuter, { borderColor: color + '33' }]}>
        {/* Filled ring using thick border on filled side */}
        <View style={[styles.ringFill, { borderColor: color }]}>
          {/* Score number */}
          <View style={styles.ringInner}>
            <Text style={[styles.scoreNum, { color }]}>{score}</Text>
            <Text style={[styles.scorePct, { color }]}>%</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.scoreHint, { color: color + 'CC' }]}>{hint}</Text>
      {!isMax && (
        <View style={styles.scoreBoostRow}>
          <Ionicons name="add-circle-outline" size={12} color={tokens.colorTextMuted} />
          <Text style={styles.scoreBoostText}>
            +{100 - score} pts verificando al conductor
          </Text>
        </View>
      )}
    </View>
  );
}

export function VerdictCard({ verdict, placa, score }: VerdictCardProps) {
  const color = verdictColors[verdict];
  const border = verdictBorders[verdict];
  const { scale, opacity } = useScaleBounce(true);

  return (
    <Animated.View
      testID="verdict-card"
      style={[styles.outer, { borderColor: border, transform: [{ scale }], opacity }]}
    >
      {/* Glass fill layers */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: TINTS[verdict], borderRadius: radius.xxl }]} />
      <View style={[StyleSheet.absoluteFill, styles.glassFill, { borderRadius: radius.xxl }]} />
      <View style={styles.specularTop} />

      {/* Content */}
      <View style={styles.content}>
        {/* Icon + label row */}
        <View style={styles.topRow}>
          <View style={[styles.iconRing, { backgroundColor: TINTS[verdict], borderColor: border }]}>
            <Ionicons name={ICONS[verdict]} size={22} color={color} />
          </View>
          <View style={styles.topText}>
            <Text style={[styles.label, { color }]}>{verdictLabels[verdict]}</Text>
            <View style={[styles.placaPill, { borderColor: border }]}>
              <Text style={[styles.placa, { color: tokens.colorTextSecondary }]}>{placa}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: border }]} />

        {/* Score */}
        {score !== undefined && (
          <ScoreRing score={score} color={color} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.xxl,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 16,
  },
  glassFill: { backgroundColor: 'rgba(255,255,255,0.018)' },
  specularTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    zIndex: 2,
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  iconRing: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topText: { flex: 1, gap: 6 },
  label: { ...type.title2, letterSpacing: -0.3 },
  placaPill: {
    borderWidth: 0.5,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  placa: {
    fontSize: 14,
    fontFamily: fontMono,
    letterSpacing: 4,
    fontWeight: '600',
  },
  divider: {
    height: 0.5,
    opacity: 0.3,
    marginBottom: 20,
  },

  // Score ring
  scoreWrap: { alignItems: 'center', gap: 10 },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  scoreNum: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 46,
  },
  scorePct: {
    fontSize: 18,
    fontWeight: '700',
    paddingBottom: 4,
  },
  scoreHint: {
    ...type.subheadline,
    fontWeight: '600',
  },
  scoreBoostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scoreBoostText: {
    ...type.caption1,
    color: tokens.colorTextMuted,
  },
});
