import React, { useState, useCallback } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type } from '../src/lib/tokens';
import { useFadeSlideIn } from '../src/lib/animations';
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

const VERDICT_ICON: Record<string, string> = {
  verde: 'checkmark-circle',
  ambar: 'warning',
  rojo: 'close-circle',
};

function EntryRow({
  entry,
  onDelete,
}: {
  entry: HistorialEntry;
  onDelete: (id: string) => void;
}) {
  const color = VERDICT_COLOR[entry.color] ?? tokens.colorTextSecondary;
  const tint = VERDICT_TINT[entry.color] ?? 'transparent';
  const icon = VERDICT_ICON[entry.color] ?? 'help-circle';

  return (
    <GlassCard style={styles.entryCard}>
      <View style={[styles.entryIconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <View style={styles.entryBody}>
        <Text style={styles.entryPlaca}>{entry.placa}</Text>
        <Text style={styles.entryResumen} numberOfLines={1}>
          {entry.resumen}
        </Text>
        <Text style={styles.entryFecha}>{formatFecha(entry.fechaIso)}</Text>
      </View>

      <Pressable
        onPress={() => onDelete(entry.id)}
        hitSlop={12}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="trash-outline" size={16} color={tokens.colorTextMuted} />
      </Pressable>
    </GlassCard>
  );
}

export default function Historial() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<HistorialEntry[]>([]);
  const heroAnim = useFadeSlideIn(0);

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
      <View pointerEvents="none" style={styles.ambientGlow} />

      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="time" size={26} color={tokens.colorBrand} />
            </View>
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
          <View style={styles.list}>
            {entries.map((e) => (
              <EntryRow key={e.id} entry={e} onDelete={handleDelete} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colorBackground },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'transparent',
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 100,
  },
  content: { paddingHorizontal: spacing.lg },

  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xl },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
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
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 8, padding: 8,
  },
  clearText: { ...type.footnote, color: tokens.colorTextMuted },

  list: { gap: spacing.sm },
  entryCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.md,
  },
  entryIconWrap: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  entryBody: { flex: 1, gap: 2 },
  entryPlaca: { ...type.headline, color: tokens.colorText, fontVariant: ['tabular-nums'] },
  entryResumen: { ...type.footnote, color: tokens.colorTextSecondary },
  entryFecha: { ...type.caption1, color: tokens.colorTextMuted },
  deleteBtn: { padding: 4, flexShrink: 0 },
});
