import React, { useState } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type } from '../src/lib/tokens';
import { toVerdict } from '../src/lib/colores';
import { useFadeSlideIn, useShake } from '../src/lib/animations';
import { GlassCard } from '../src/components/GlassCard';
import { PlateInput } from '../src/components/PlateInput';
import { Button } from '../src/components/Button';
import { VerdictCard } from '../src/components/VerdictCard';
import { CheckList } from '../src/components/CheckList';
import { ContratoResult } from '../src/components/ContratoResult';
import { EmptyState } from '../src/components/EmptyState';
import { verificarComprador, type CompradorResult } from '../src/api/verificar';

export default function Comprador() {
  const insets = useSafeAreaInsets();
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState<CompradorResult | null>(null);
  const [archivo, setArchivo] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const heroAnim = useFadeSlideIn(0);
  const cardAnim = useFadeSlideIn(80);
  const { translateX, shake } = useShake();

  const seleccionarContrato = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setArchivo({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
      }
    } catch {
      // usuario canceló
    }
  };

  const verificar = async () => {
    if (!placa.trim()) return;
    setError('');
    setResultado(null);
    setCargando(true);
    try {
      const data = await verificarComprador(placa.trim().toUpperCase(), archivo ?? undefined);
      setResultado(data);
      Haptics.notificationAsync(
        data.veredicto.color === 'verde'
          ? Haptics.NotificationFeedbackType.Success
          : data.veredicto.color === 'rojo'
            ? Haptics.NotificationFeedbackType.Error
            : Haptics.NotificationFeedbackType.Warning,
      );
    } catch {
      setError('No pudimos verificar. Revisa tu conexión.');
      shake();
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.ambientGlow} />

      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="search" size={26} color={tokens.colorBrand} />
          </View>
          <Text style={styles.heroTitle}>Comprador</Text>
          <Text style={styles.heroSub}>Verifica antes de comprar</Text>
        </Animated.View>

        {/* Input card */}
        <Animated.View style={cardAnim}>
          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>Placa del vehículo</Text>
            <PlateInput value={placa} onChange={setPlaca} onSubmit={verificar} loading={cargando} />

            <Pressable
              style={({ pressed }) => [
                styles.attachBtn,
                archivo && styles.attachBtnActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={seleccionarContrato}
              disabled={cargando}
            >
              <Ionicons
                name={archivo ? 'document-text' : 'attach'}
                size={18}
                color={archivo ? tokens.colorBrand : tokens.colorTextSecondary}
              />
              <Text style={[styles.attachText, archivo && styles.attachTextActive]} numberOfLines={1}>
                {archivo ? archivo.name : 'Adjuntar contrato (opcional)'}
              </Text>
              {archivo && (
                <Pressable onPress={() => setArchivo(null)} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={tokens.colorTextMuted} />
                </Pressable>
              )}
            </Pressable>

            <Button onPress={verificar} loading={cargando} disabled={!placa.trim()}>
              Verificar vehículo
            </Button>
          </GlassCard>
        </Animated.View>

        {/* Error */}
        {error !== '' && (
          <Animated.View style={{ transform: [{ translateX }] }}>
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={16} color={tokens.colorDanger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Animated.View>
        )}

        {/* Empty */}
        {!resultado && !cargando && !error && (
          <EmptyState
            icon="document-text-outline"
            title="Verifica el vehículo y su contrato"
            subtitle="Analiza cláusulas riesgosas con IA antes de firmar"
          />
        )}

        {/* Results */}
        {resultado && (
          <View style={styles.results}>
            <VerdictCard verdict={toVerdict(resultado.veredicto.color)} placa={resultado.veredicto.placa} />
            <CheckList checks={resultado.veredicto.checks} />
            {resultado.contrato && <ContratoResult analisis={resultado.contrato} />}
          </View>
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
    shadowOpacity: 0.18, shadowRadius: 100,
  },
  content: { paddingHorizontal: spacing.lg },

  hero: { alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: spacing.xl },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: tokens.colorBrandTint,
    borderWidth: 0.5, borderColor: tokens.colorBrandBorder,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 14,
  },
  heroTitle: { ...type.largeTitle, color: tokens.colorText, marginBottom: 4 },
  heroSub:   { ...type.title3, color: tokens.colorTextSecondary, fontWeight: '400' },

  card: { padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  cardLabel: {
    ...type.footnote, color: tokens.colorTextMuted,
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  attachBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(44,44,46,0.55)',
    borderWidth: 0.5, borderColor: tokens.colorLine,
    borderRadius: radius.lg, padding: 14, minHeight: 48,
  },
  attachBtnActive: { backgroundColor: tokens.colorBrandTint, borderColor: tokens.colorBrandBorder },
  attachText: { flex: 1, ...type.subheadline, color: tokens.colorTextSecondary },
  attachTextActive: { color: tokens.colorBrand },

  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: tokens.colorDangerTint,
    borderWidth: 0.5, borderColor: 'rgba(255,69,58,0.3)',
    borderRadius: radius.lg, padding: 14, marginBottom: spacing.lg,
  },
  errorText: { ...type.subheadline, color: tokens.colorDanger, flex: 1 },
  results: { gap: 0 },
});
