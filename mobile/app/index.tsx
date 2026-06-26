import React, { useState } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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
import { VehicleCard } from '../src/components/VehicleCard';
import { ShareButton } from '../src/components/ShareButton';
import { EmptyState } from '../src/components/EmptyState';
import { verificarPasajero, type Veredicto } from '../src/api/verificar';
import { ocrPlaca } from '../src/api/ocr';

export default function Pasajero() {
  const insets = useSafeAreaInsets();
  const [placa, setPlaca] = useState('');
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [vehicleMatch, setVehicleMatch] = useState<boolean | null>(null);

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
      const v = await verificarPasajero(placa.trim().toUpperCase());
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
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="shield-checkmark" size={28} color={tokens.colorBrand} />
          </View>
          <Text style={styles.heroTitle}>SubeSeguro</Text>
          <Text style={styles.heroSub}>Verifica antes de subir</Text>
        </Animated.View>

        {/* Input card — liquid glass */}
        <Animated.View style={cardAnim}>
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
