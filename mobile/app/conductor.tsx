import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { tokens, spacing, radius } from '../src/lib/tokens';
import { PlateInput } from '../src/components/PlateInput';
import { Button } from '../src/components/Button';
import { crearQrConductor } from '../src/api/verificar';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Conductor() {
  const [placa, setPlaca] = useState('');
  const [dni, setDni] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Conductor verificado</Text>
      <Text style={styles.subtitle}>
        Genera tu QR para que los pasajeros te verifiquen al instante
      </Text>

      <View style={styles.inputSection}>
        <PlateInput value={placa} onChange={setPlaca} loading={false} />
        <TextInput
          testID="input-dni"
          style={styles.dniInput}
          placeholder="DNI (8 dígitos)"
          placeholderTextColor={tokens.colorTextMuted}
          keyboardType="number-pad"
          maxLength={8}
          value={dni}
          onChangeText={setDni}
        />
        <Button onPress={generar} loading={cargando} disabled={!placa.trim() || !dni.trim()}>
          Generar mi QR
        </Button>
      </View>

      {error !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {qrUrl !== '' && (
        <View style={styles.qrSection}>
          <Image style={styles.qr} source={{ uri: qrUrl }} />
          <Text style={styles.qrHint}>
            Muestra este QR a tus pasajeros. Al escanearlo, verifican tu vehículo en tiempo real.
          </Text>
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
  dniInput: {
    backgroundColor: tokens.colorSurface,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    borderRadius: radius.md,
    padding: 16,
    fontSize: 18,
    color: tokens.colorText,
    letterSpacing: 2,
  },
  errorBox: { backgroundColor: tokens.colorDanger + '15', padding: 12, borderRadius: radius.sm, marginTop: spacing.md },
  errorText: { color: tokens.colorDanger, fontSize: 14 },
  qrSection: { alignItems: 'center', marginTop: spacing.lg },
  qr: { width: 240, height: 240, borderRadius: radius.md },
  qrHint: { fontSize: 13, color: tokens.colorTextMuted, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, lineHeight: 19 },
});
