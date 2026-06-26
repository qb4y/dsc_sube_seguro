import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type } from '../src/lib/tokens';
import { toVerdict } from '../src/lib/colores';
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
    } finally {
      setCargando(false);
    }
  };

  const tomarFoto = async () => {
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
    <ScrollView
      style={[styles.scroll, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark" size={28} color={tokens.colorBrand} />
        </View>
        <Text style={styles.heroTitle}>SubeSeguro</Text>
        <Text style={styles.heroSub}>Verifica antes de subir</Text>
      </View>

      {/* Input card */}
      <View style={styles.card}>
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
      </View>

      {/* Error */}
      {error !== '' && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={16} color={tokens.colorDanger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Empty */}
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
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: tokens.colorBackground },
  content: { paddingHorizontal: spacing.lg },

  hero: {
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: tokens.colorBrandTint,
    borderWidth: 0.5,
    borderColor: tokens.colorBrandBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    ...type.largeTitle,
    color: tokens.colorText,
    marginBottom: 4,
  },
  heroSub: {
    ...type.title3,
    color: tokens.colorTextSecondary,
    fontWeight: '400',
  },

  card: {
    backgroundColor: tokens.colorSurface,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  cardLabel: {
    ...type.footnote,
    color: tokens.colorTextMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  buttonRow: { flexDirection: 'row', gap: 10 },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colorDangerTint,
    borderWidth: 0.5,
    borderColor: 'rgba(255,69,58,0.3)',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.lg,
  },
  errorText: { ...type.subheadline, color: tokens.colorDanger, flex: 1 },

  results: { gap: 0 },
});
