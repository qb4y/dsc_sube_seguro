import React, { useState, useRef, useEffect } from 'react';
import { Alert, Animated, ScrollView, TouchableOpacity, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { tokens, spacing, radius, type, fontMono } from '../src/lib/tokens';
import { useFadeSlideIn, useScaleBounce, useBreathingGlow, useFloat } from '../src/lib/animations';
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
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const exportRef = useRef<ViewShotRef>(null);

  const heroAnim = useFadeSlideIn(0);
  const cardAnim = useFadeSlideIn(100, 32);
  const glowAnim = useBreathingGlow();
  const floatAnim = useFloat(4, 3800);
  const { scale: qrScale, opacity: qrOpacity } = useScaleBounce(qrUrl !== '');

  // Loading shimmer
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (cargando) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }
    shimmer.setValue(0);
  }, [cargando]);

  // QR float animation — only when QR is showing
  const qrFloatAnim = useFloat(5, 4000);

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

  const descargar = async () => {
    if (!exportRef.current) return;
    setDescargando(true);
    try {
      const uri = await exportRef.current!.capture!();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('No disponible', 'Tu dispositivo no soporta compartir archivos.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir QR conductor' });
    } catch {
      Alert.alert('Error', 'No se pudo exportar el QR.');
    } finally {
      setDescargando(false);
    }
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
          <Animated.View style={[styles.heroIconWrap, floatAnim]}>
            <Ionicons name="qr-code" size={26} color={tokens.colorBrand} />
          </Animated.View>
          <Text style={styles.heroTitle}>Conductor</Text>
          <Text style={styles.heroSub}>Genera tu QR verificado</Text>
        </Animated.View>

        {/* Loading indicator */}
        {cargando && (
          <Animated.View style={[styles.loadingBar, { opacity: shimmer }]}>
            <View style={styles.loadingBarInner} />
          </Animated.View>
        )}

        {/* Input card */}
        <Animated.View style={cardAnim}>
          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>Datos del conductor</Text>
            <PlateInput value={placa} onChange={setPlaca} loading={false} />
            <View style={styles.actionGroup}>
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
            </View>
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

        {/* QR — scale bounce entrance + floating */}
        {qrUrl !== '' && (
          <Animated.View style={{ transform: [{ scale: qrScale }], opacity: qrOpacity }}>
            {/* Capturable export card */}
            <ViewShot ref={exportRef} options={{ format: 'png', quality: 1 }}>
              <View style={styles.exportCard}>
                {/* Brand header */}
                <View style={styles.exportHeader}>
                  <View style={styles.exportLogo}>
                    <Ionicons name="shield-checkmark" size={18} color={tokens.colorBrand} />
                  </View>
                  <Text style={styles.exportAppName}>SubeSeguro</Text>
                  <View style={styles.exportBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={tokens.colorSuccess} />
                    <Text style={styles.exportBadgeText}>Verificado</Text>
                  </View>
                </View>

                {/* Separator */}
                <View style={styles.exportSep} />

                {/* Plate */}
                <Text style={styles.exportLabel}>PLACA DEL VEHÍCULO</Text>
                <Text style={styles.exportPlaca}>{placa}</Text>

                {/* QR */}
                <View style={styles.exportQrWrap}>
                  <Image style={styles.exportQr} source={{ uri: qrUrl }} resizeMode="contain" />
                </View>

                {/* Instructions */}
                <Text style={styles.exportInstruction}>
                  Escanea para verificar el vehículo
                </Text>

                {/* Footer */}
                <View style={styles.exportSep} />
                <Text style={styles.exportFooter}>subeseguro.pe · Verificación en tiempo real</Text>
              </View>
            </ViewShot>

            {/* Download button — outside ViewShot so not captured */}
            <TouchableOpacity
              style={[styles.downloadBtn, descargando && styles.downloadBtnDisabled]}
              onPress={descargar}
              disabled={descargando}
              activeOpacity={0.75}
            >
              <Ionicons
                name={descargando ? 'hourglass-outline' : 'download-outline'}
                size={18}
                color={tokens.colorBrand}
              />
              <Text style={styles.downloadBtnText}>
                {descargando ? 'Exportando…' : 'Descargar / Compartir'}
              </Text>
            </TouchableOpacity>
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
    shadowOpacity: 0.22, shadowRadius: 120,
  },
  content: { paddingHorizontal: spacing.lg },

  hero: { alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: spacing.lg },
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

  loadingBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: tokens.colorBrandTint,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  loadingBarInner: {
    height: 3,
    width: '60%',
    borderRadius: 2,
    backgroundColor: tokens.colorBrand,
  },

  card: { padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  actionGroup: { gap: 14, marginTop: 4 },
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

  // Branded export card
  exportCard: {
    backgroundColor: '#0A0A0F',
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: tokens.colorBrandBorder,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  exportHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: 'rgba(47,214,198,0.07)',
  },
  exportLogo: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: tokens.colorBrandTint,
    borderWidth: 0.5, borderColor: tokens.colorBrandBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  exportAppName: {
    flex: 1,
    fontSize: 17, fontWeight: '700', color: tokens.colorText, letterSpacing: -0.3,
  },
  exportBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(48,209,88,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  exportBadgeText: { fontSize: 11, fontWeight: '600', color: tokens.colorSuccess },
  exportSep: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  exportLabel: {
    fontSize: 10, fontWeight: '700', color: tokens.colorTextMuted,
    letterSpacing: 1.2, textTransform: 'uppercase',
    textAlign: 'center', marginTop: 20, marginBottom: 6,
  },
  exportPlaca: {
    fontSize: 32, fontFamily: fontMono, fontWeight: '800',
    color: tokens.colorText, letterSpacing: 6,
    textAlign: 'center', marginBottom: 20,
  },
  exportQrWrap: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 12,
    marginBottom: 20,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  exportQr: { width: 200, height: 200 },
  exportInstruction: {
    ...type.footnote, color: tokens.colorTextSecondary,
    textAlign: 'center', marginBottom: 20, letterSpacing: 0.1,
  },
  exportFooter: {
    ...type.caption2, color: tokens.colorTextMuted,
    textAlign: 'center', paddingVertical: 12, letterSpacing: 0.3,
  },
  // Download button
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: tokens.colorBrandTint,
    borderWidth: 0.5, borderColor: tokens.colorBrandBorder,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadBtnText: { ...type.headline, color: tokens.colorBrand },
});
