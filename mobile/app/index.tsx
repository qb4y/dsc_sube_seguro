import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { tokens, spacing, radius } from '../src/lib/tokens';
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Revisa antes de subir</Text>
      <Text style={styles.subtitle}>
        Ingresa la placa del vehículo para verificar su estado
      </Text>

      <View style={styles.inputSection}>
        <PlateInput value={placa} onChange={setPlaca} onSubmit={verificar} loading={cargando} />
        <View style={styles.buttonRow}>
          <View style={{ flex: 1 }}>
            <Button onPress={verificar} loading={cargando} disabled={!placa.trim()}>
              Verificar
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="ghost" onPress={tomarFoto} disabled={cargando}>
              📷 Foto
            </Button>
          </View>
        </View>
      </View>

      {error !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!veredicto && !cargando && !error && (
        <EmptyState
          icon="shield-checkmark-outline"
          title="Ingresa una placa para comenzar"
          subtitle="Verificaremos SOAT, revision tecnica y datos del vehiculo en tiempo real"
        />
      )}

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
  content: { padding: spacing.lg, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '800', color: tokens.colorText, marginBottom: 4 },
  subtitle: { fontSize: 14, color: tokens.colorTextMuted, marginBottom: spacing.lg },
  inputSection: { gap: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  errorBox: { backgroundColor: tokens.colorDanger + '15', padding: 12, borderRadius: radius.sm, marginTop: spacing.md },
  errorText: { color: tokens.colorDanger, fontSize: 14 },
  results: { marginTop: spacing.lg },
});
