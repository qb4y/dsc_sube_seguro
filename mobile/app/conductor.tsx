import React, { useState } from 'react';
import { Animated, ScrollView, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type, fontMono } from '../src/lib/tokens';
import { useFadeSlideIn, useScaleBounce } from '../src/lib/animations';
import { GlassCard } from '../src/components/GlassCard';
import { PlateInput } from '../src/components/PlateInput';
import { Button } from '../src/components/Button';
import { crearQrConductor } from '../src/api/verificar';
import { EmptyState } from '../src/components/EmptyState';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Conductor() {
  const insets = useSafeAreaInsets();
  const [placa, setPlaca] = useState('');
  const [dni, setDni] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const heroAnim = useFadeSlideIn(0);
  const cardAnim = useFadeSlideIn(80);
  const { scale: qrScale, opacity: qrOpacity } = useScaleBounce(qrUrl !== '');

  const generar = async () => {
    if (!placa.trim() || !dni.trim()) return;
    setError('');
    setQrUrl('');
    setCargando(true);
    try {
      const { report_id } = await crearQrConductor(placa.trim().toUpperCase(), dni.trim());
      setQrUrl(`${API}/conductor/qr.png?report_id=${report_id}`);
    } catch {
      setError('No pudimos generar el QR. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.ambientGlow} />

      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="qr-code" size={26} color={tokens.colorBrand} />
          </View>
          <Text style={styles.heroTitle}>Conductor</Text>
          <Text style={styles.heroSub}>Genera tu QR verificado</Text>
        </Animated.View>

        {/* Input card */}
        <Animated.View style={cardAnim}>
          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>Datos del conductor</Text>
            <PlateInput value={placa} onChange={setPlaca} loading={false} />
            <TextInput
              testID="input-dni"
              style={[styles.dniInput, focused && styles.dniInputFocused]}
              placeholder="DNI (8 dígitos)"
              placeholderTextColor={tokens.colorTextMuted}
              keyboardType="number-pad"
              maxLength={8}
              value={dni}
              onChangeText={setDni}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              selectionColor={tokens.colorBrand}
            />
            <Button onPress={generar} loading={cargando} disabled={!placa.trim() || !dni.trim()}>
              Generar mi QR
            </Button>
          </GlassCard>
        </Animated.View>

        {/* Error */}
        {error !== '' && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={16} color={tokens.colorDanger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Empty */}
        {!qrUrl && !cargando && !error && (
          <EmptyState
            icon="qr-code-outline"
            title="Genera tu código QR"
            subtitle="Tus pasajeros lo escanearán para verificar tu vehículo al instante"
          />
        )}

        {/* QR — scale bounce entrance */}
        {qrUrl !== '' && (
          <Animated.View style={{ transform: [{ scale: qrScale }], opacity: qrOpacity }}>
            <GlassCard style={styles.qrCard} borderRadius={radius.xxl}>
              {/* Header */}
              <View style={styles.qrHeader}>
                <View style={styles.qrHeaderIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={tokens.colorSuccess} />
                </View>
                <Text style={styles.qrHeaderText}>QR listo para mostrar</Text>
              </View>

              <View style={styles.qrSep} />

              {/* QR image */}
              <View style={styles.qrImageContainer}>
                <View style={[styles.qrGradFrame, { backgroundColor: tokens.colorBrandTint, borderColor: tokens.colorBrandBorder }]}>
                  <View style={styles.qrImageWrap}>
                    <Image style={styles.qr} source={{ uri: qrUrl }} resizeMode="contain" />
                  </View>
                </View>
              </View>

              {/* Meta */}
              <View style={styles.qrMeta}>
                <Text style={styles.qrPlaca}>{placa}</Text>
                <Text style={styles.qrHint}>
                  Muestra este QR a tus pasajeros para que verifiquen tu vehículo en tiempo real.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
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

  card: { padding: spacing.xl, gap: spacing.xl, marginBottom: spacing.lg },
  cardLabel: {
    ...type.footnote, color: tokens.colorTextMuted,
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  dniInput: {
    backgroundColor: 'rgba(44,44,46,0.55)',
    borderWidth: 1, borderColor: tokens.colorLine,
    borderRadius: radius.lg,
    paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 22, color: tokens.colorText,
    letterSpacing: 4, fontFamily: fontMono, fontWeight: '600',
    minHeight: 62,
  },
  dniInputFocused: {
    borderColor: tokens.colorBrand,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },

  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: tokens.colorDangerTint,
    borderWidth: 0.5, borderColor: 'rgba(255,69,58,0.3)',
    borderRadius: radius.lg, padding: 14, marginBottom: spacing.lg,
  },
  errorText: { ...type.subheadline, color: tokens.colorDanger, flex: 1 },

  qrCard: { marginBottom: spacing.lg },
  qrHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  qrHeaderIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(48,209,88,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  qrHeaderText: { ...type.headline, color: tokens.colorSuccess },
  qrSep: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  qrImageContainer: { padding: 24, alignItems: 'center' },
  qrGradFrame: {
    borderRadius: radius.xl, padding: 16,
    borderWidth: 0.5,
  },
  qrImageWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  qr: { width: 200, height: 200 },
  qrMeta: { padding: 16, paddingTop: 4, gap: 6 },
  qrPlaca: {
    fontSize: 20, fontFamily: fontMono, color: tokens.colorText,
    fontWeight: '700', letterSpacing: 4,
  },
  qrHint: { ...type.footnote, color: tokens.colorTextSecondary, lineHeight: 19 },
});
