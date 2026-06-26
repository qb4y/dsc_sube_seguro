import React, { useState, useRef, useEffect } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type, fontMono } from '../src/lib/tokens';
import { toVerdict } from '../src/lib/colores';
import { useFadeSlideIn, useShake } from '../src/lib/animations';
import { GlassCard } from '../src/components/GlassCard';
import { PlateInput } from '../src/components/PlateInput';
import { Button } from '../src/components/Button';
import { VerdictCard } from '../src/components/VerdictCard';
import { CheckList } from '../src/components/CheckList';
import { VehicleCard } from '../src/components/VehicleCard';
import { ShareButton } from '../src/components/ShareButton';
import { EmptyState } from '../src/components/EmptyState';
import { verificarPasajero, type Veredicto } from '../src/api/verificar';
import { ocrPlaca } from '../src/api/ocr';

// ── Mock data for testing (use plate BCD-456 to trigger) ──
const MOCK_VEREDICTO: Veredicto = {
  color: 'verde',
  resumen: 'Vehículo en regla',
  placa: 'BCD-456',
  checks: [
    { clave: 'soat', etiqueta: 'SOAT', color: 'verde', detalle: 'Vigente hasta 15/03/2027', fuente: 'SBS', consultado_en: new Date().toISOString() },
    { clave: 'revision_tecnica', etiqueta: 'Revisión Técnica', color: 'verde', detalle: 'Aprobada hasta 20/12/2026', fuente: 'MTC', consultado_en: new Date().toISOString() },
    { clave: 'vehiculo', etiqueta: 'Datos del vehículo', color: 'verde', detalle: 'TOYOTA Corolla Blanco 2021', fuente: 'SUNARP', consultado_en: new Date().toISOString() },
    { clave: 'papeletas', etiqueta: 'Papeletas', color: 'verde', detalle: 'Sin papeletas pendientes', fuente: 'SAT', consultado_en: new Date().toISOString() },
  ],
};

export default function Pasajero() {
  const insets = useSafeAreaInsets();
  const [placa, setPlaca] = useState('');
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [vehicleMatch, setVehicleMatch] = useState<boolean | null>(null);

  // Card collapse + badge animation when results appear
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const cardCollapseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (veredicto) {
      Animated.parallel([
        Animated.spring(badgeAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(cardCollapseAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    } else {
      badgeAnim.setValue(0);
      cardCollapseAnim.setValue(1);
    }
  }, [veredicto]);

  const heroAnim = useFadeSlideIn(0);
  const cardAnim = useFadeSlideIn(80);
  const { translateX, shake } = useShake();

  const verificar = async () => {
    if (!placa.trim()) return;
    setError('');
    setVeredicto(null);
    setVehicleMatch(null);
    setCargando(true);
    try {
      // Use mock data for testing — type BCD-456
      const v = placa.trim().toUpperCase() === 'BCD-456'
        ? await new Promise<Veredicto>((r) => setTimeout(() => r({ ...MOCK_VEREDICTO, placa: placa.trim().toUpperCase() }), 1200))
        : await verificarPasajero(placa.trim().toUpperCase());
      setVeredicto(v);
      Haptics.notificationAsync(
        v.color === 'verde'
          ? Haptics.NotificationFeedbackType.Success
          : v.color === 'rojo'
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

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso de cámara para escanear la placa.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (res.canceled || !res.assets?.[0]) return;
    setCargando(true);
    try {
      const candidatas = await ocrPlaca(res.assets[0].uri);
      if (candidatas[0]) setPlaca(candidatas[0]);
    } catch {
      setError('No pudimos leer la placa de la foto.');
    } finally {
      setCargando(false);
    }
  };

  const vehiculoCheck = veredicto?.checks.find((c) => c.clave === 'vehiculo');
  const descripcion = vehiculoCheck?.detalle ?? '';
  const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.root}>
      {/* Radial ambient glow — top center */}
      <View pointerEvents="none" style={styles.ambientGlow} />

      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero + plate badge */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="shield-checkmark" size={28} color={tokens.colorBrand} />
            </View>
            {/* Plate badge — appears top-right when results load, tap to search again */}
            {veredicto && (
              <Pressable onPress={() => { setVeredicto(null); setPlaca(''); }}>
                <Animated.View style={[
                  styles.plateBadge,
                  {
                    opacity: badgeAnim,
                    transform: [
                      { translateX: badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                      { scale: badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                    ],
                  },
                ]}>
                  <View style={[
                    styles.plateBadgeDot,
                    { backgroundColor: veredicto.color === 'verde' ? tokens.colorSuccess : veredicto.color === 'rojo' ? '#FF453A' : tokens.colorWarning },
                  ]} />
                  <Text style={styles.plateBadgeText}>{veredicto.placa}</Text>
                  <Ionicons name="close-circle" size={14} color={tokens.colorTextMuted} />
                </Animated.View>
              </Pressable>
            )}
          </View>
          <Text style={styles.heroTitle}>SubeSeguro</Text>
          <Text style={styles.heroSub}>Verifica antes de subir</Text>
        </Animated.View>

        {/* Input card — collapses when results appear */}
        {!veredicto && (
          <Animated.View style={[cardAnim, {
            opacity: cardCollapseAnim,
            transform: [
              ...(cardAnim.transform ?? []),
              { scale: cardCollapseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
            ],
          }]}>
            <GlassCard style={styles.card}>
              <Text style={styles.cardLabel}>Placa del vehículo</Text>
              <PlateInput value={placa} onChange={setPlaca} onSubmit={verificar} loading={cargando} />
              <View style={styles.buttonRow}>
                <View style={{ flex: 1 }}>
                  <Button onPress={verificar} loading={cargando} disabled={!placa.trim()}>
                    Verificar
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button variant="ghost" onPress={tomarFoto} disabled={cargando}>
                    Usar cámara
                  </Button>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Error */}
        {error !== '' && (
          <Animated.View style={{ transform: [{ translateX }] }}>
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={16} color={tokens.colorDanger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Animated.View>
        )}

        {/* Empty state */}
        {!veredicto && !cargando && !error && (
          <EmptyState
            icon="shield-checkmark-outline"
            title="Ingresa una placa para comenzar"
            subtitle="Verificamos SOAT, revisión técnica y datos del vehículo en tiempo real"
          />
        )}

        {/* Results */}
        {veredicto && (
          <View style={styles.results}>
            <VerdictCard verdict={toVerdict(veredicto.color)} placa={veredicto.placa} />
            {vehiculoCheck && (
              <VehicleCard
                vehicle={{
                  marca: descripcion.split(' ')[2] ?? '',
                  modelo: descripcion.split(' ')[3] ?? '',
                  color: descripcion.split(' ')[4] ?? '',
                }}
                match={vehicleMatch}
                onMatch={setVehicleMatch}
              />
            )}
            <CheckList checks={veredicto.checks} />
            <ShareButton placa={veredicto.placa} descripcion={descripcion} hora={hora} />
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
    shadowOpacity: 0.18,
    shadowRadius: 100,
  },
  content: { paddingHorizontal: spacing.lg },

  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xl },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(44,44,46,0.8)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  plateBadgeText: {
    fontFamily: fontMono,
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colorText,
    letterSpacing: 2,
  },
  plateBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  heroSub:   { ...type.title3, color: tokens.colorTextSecondary, fontWeight: '400' },

  card: { padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  cardLabel: {
    ...type.footnote, color: tokens.colorTextMuted,
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  buttonRow: { flexDirection: 'row', gap: 10 },

  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: tokens.colorDangerTint,
    borderWidth: 0.5, borderColor: 'rgba(255,69,58,0.3)',
    borderRadius: radius.lg, padding: 14, marginBottom: spacing.lg,
  },
  errorText: { ...type.subheadline, color: tokens.colorDanger, flex: 1 },
  results: { gap: 0 },
});
