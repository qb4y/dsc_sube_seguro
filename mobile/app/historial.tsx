import React, { useState, useCallback } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type, fontMono } from '../src/lib/tokens';
import {
  useFadeSlideIn,
  useBreathingGlow,
  useFloat,
  useStaggeredEntrance,
  useSpringPress,
} from '../src/lib/animations';
import { GlassCard } from '../src/components/GlassCard';
import { EmptyState } from '../src/components/EmptyState';
import {
  cargarHistorial,
  borrarEntrada,
  borrarHistorial,
  formatFecha,
  type HistorialEntry,
} from '../src/lib/history';

const VERDICT_COLOR: Record<string, string> = {
  verde: tokens.colorSuccess,
  ambar: tokens.colorWarning,
  rojo: tokens.colorDanger,
};

const VERDICT_TINT: Record<string, string> = {
  verde: tokens.colorSuccessTint,
  ambar: tokens.colorWarningTint,
  rojo: tokens.colorDangerTint,
};

const VERDICT_BORDER: Record<string, string> = {
  verde: 'rgba(48,209,88,0.28)',
  ambar: 'rgba(255,214,10,0.28)',
  rojo: 'rgba(255,69,58,0.28)',
};

const VERDICT_ICON: Record<string, string> = {
  verde: 'checkmark-circle',
  ambar: 'warning',
  rojo: 'close-circle',
};

const VERDICT_LABEL: Record<string, string> = {
  verde: 'Seguro',
  ambar: 'Precaución',
  rojo: 'Riesgo',
};

/* ── Animated entry row ── */
function EntryRow({
  entry,
  index,
  onDelete,
}: {
  entry: HistorialEntry;
  index: number;
  onDelete: (id: string) => void;
}) {
  const color = VERDICT_COLOR[entry.color] ?? tokens.colorTextSecondary;
  const tint = VERDICT_TINT[entry.color] ?? 'transparent';
  const border = VERDICT_BORDER[entry.color] ?? tokens.colorLine;
  const icon = VERDICT_ICON[entry.color] ?? 'help-circle';
  const label = VERDICT_LABEL[entry.color] ?? '';
  const anim = useStaggeredEntrance(index, 80);
  const { scale, onPressIn, onPressOut } = useSpringPress();

  return (
    <Animated.View style={anim}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.entryOuter, { borderColor: border, transform: [{ scale }] }]}>
          {/* Glass layers */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tint, borderRadius: radius.xl }]} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28,28,30,0.82)', borderRadius: radius.xl }]} />
          <View style={[styles.specular, { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]} />

          <View style={styles.entryContent}>
            {/* Top row */}
            <View style={styles.entryTopRow}>
              <View style={styles.entryLeft}>
                <View style={[styles.entryIconWrap, { backgroundColor: tint }]}>
                  <Ionicons name={icon as any} size={20} color={color} />
                </View>
                <View style={styles.entryTextGroup}>
                  <Text style={styles.entryPlaca}>{entry.placa}</Text>
                  <Text style={styles.entryResumen} numberOfLines={1}>{entry.resumen}</Text>
                </View>
              </View>

              <View style={styles.entryRight}>
                <View style={[styles.verdictBadge, { backgroundColor: tint }]}>
                  <Text style={[styles.verdictBadgeText, { color }]}>{label}</Text>
                </View>
              </View>
            </View>

            {/* Bottom row */}
            <View style={styles.entryBottomRow}>
              <Text style={styles.entryFecha}>{formatFecha(entry.fechaIso)}</Text>
              <Pressable
                onPress={() => onDelete(entry.id)}
                hitSlop={12}
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}
              >
                <Ionicons name="trash-outline" size={15} color={tokens.colorTextMuted} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ── Stats bar ── */
function StatsBar({ entries }: { entries: HistorialEntry[] }) {
  const anim = useFadeSlideIn(40, 20);
  const total = entries.length;
  const verdes = entries.filter((e) => e.color === 'verde').length;
  const ambares = entries.filter((e) => e.color === 'ambar').length;
  const rojos = entries.filter((e) => e.color === 'rojo').length;

  const stats = [
    { label: 'Total', value: total, icon: 'analytics' as const, color: tokens.colorBrand },
    { label: 'Seguros', value: verdes, icon: 'shield-checkmark' as const, color: tokens.colorSuccess },
    { label: 'Precaución', value: ambares, icon: 'warning' as const, color: tokens.colorWarning },
    { label: 'Riesgo', value: rojos, icon: 'ban' as const, color: tokens.colorDanger },
  ];

  return (
    <Animated.View style={anim}>
      <GlassCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '1A' }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

/* ── Main screen ── */
export default function Historial() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<HistorialEntry[]>([]);
  const heroAnim = useFadeSlideIn(0);
  const glowAnim = useBreathingGlow();
  const floatAnim = useFloat(4, 3600);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial().then(setEntries);
    }, []),
  );

  const handleDelete = async (id: string) => {
    const updated = await borrarEntrada(id);
    setEntries(updated);
  };

  const handleClearAll = () => {
    Alert.alert('Borrar historial', '¿Seguro que quieres borrar todo el historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await borrarHistorial();
          setEntries([]);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Animated ambient glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ambientGlow,
          { transform: [{ scale: glowAnim.scale }], opacity: glowAnim.opacity },
        ]}
      />

      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.heroRow}>
            <Animated.View style={[styles.heroIconWrap, floatAnim]}>
              <Ionicons name="time" size={26} color={tokens.colorBrand} />
            </Animated.View>
            {entries.length > 0 && (
              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
              >
                <Ionicons name="trash-outline" size={15} color={tokens.colorTextMuted} />
                <Text style={styles.clearText}>Borrar todo</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.heroTitle}>Historial</Text>
          <Text style={styles.heroSub}>Tus últimas verificaciones</Text>
        </Animated.View>

        {entries.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="Sin verificaciones aún"
            subtitle="Las placas que consultes aparecerán aquí automáticamente"
          />
        ) : (
          <>
            {/* Stats */}
            <StatsBar entries={entries} />

            {/* List */}
            <View style={styles.list}>
              {entries.map((e, i) => (
                <EntryRow key={e.id} entry={e} index={i} onDelete={handleDelete} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colorBackground },
  ambientGlow: {
    position: 'absolute', top: -80, alignSelf: 'center',
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'transparent',
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22, shadowRadius: 120,
  },
  content: { paddingHorizontal: spacing.lg },

  hero: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  heroRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: tokens.colorBrandTint,
    borderWidth: 0.5, borderColor: tokens.colorBrandBorder,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 14,
  },
  heroTitle: { ...type.largeTitle, color: tokens.colorText, marginBottom: 4 },
  heroSub: { ...type.title3, color: tokens.colorTextSecondary, fontWeight: '400' },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(44,44,46,0.6)',
    borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  clearText: { ...type.caption1, color: tokens.colorTextMuted, fontWeight: '600' },

  /* Stats */
  statsCard: { padding: 16, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 6 },
  statIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { ...type.caption2, color: tokens.colorTextMuted, fontWeight: '600' },

  /* List */
  list: { gap: 12 },

  /* Entry card */
  entryOuter: {
    borderRadius: radius.xl,
    borderWidth: 0.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  specular: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.22)', zIndex: 2,
  },
  entryContent: { padding: 16, gap: 10, zIndex: 5 },
  entryTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  entryIconWrap: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  entryTextGroup: { flex: 1, gap: 2 },
  entryPlaca: {
    fontFamily: fontMono, fontSize: 18, fontWeight: '700',
    color: tokens.colorText, letterSpacing: 3,
  },
  entryResumen: { ...type.footnote, color: tokens.colorTextSecondary },
  entryRight: { flexShrink: 0, marginLeft: 8 },
  verdictBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
  },
  verdictBadgeText: { ...type.caption1, fontWeight: '700' },
  entryBottomRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  entryFecha: { ...type.caption1, color: tokens.colorTextMuted },
  deleteBtn: { padding: 4, flexShrink: 0 },
});
