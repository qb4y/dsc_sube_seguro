import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tokens, spacing, radius, type, fontMono } from '../src/lib/tokens';
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
    <ScrollView
      style={[styles.scroll, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="qr-code" size={26} color={tokens.colorBrand} />
        </View>
        <Text style={styles.heroTitle}>Conductor</Text>
        <Text style={styles.heroSub}>Genera tu QR verificado</Text>
      </View>

      {/* Input card */}
      <View style={styles.card}>
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

        <Button
          onPress={generar}
          loading={cargando}
          disabled={!placa.trim() || !dni.trim()}
        >
          Generar mi QR
        </Button>
      </View>

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

      {/* QR Display */}
      {qrUrl !== '' && (
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <Ionicons name="checkmark-circle" size={20} color={tokens.colorSuccess} />
            <Text style={styles.qrHeaderText}>QR generado</Text>
          </View>

          <View style={styles.qrImageWrap}>
            <Image style={styles.qr} source={{ uri: qrUrl }} resizeMode="contain" />
          </View>

          <View style={styles.qrMeta}>
            <Text style={styles.qrPlaca}>{placa}</Text>
            <Text style={styles.qrHint}>
              Muestra este QR a tus pasajeros para que verifiquen tu vehículo en tiempo real.
            </Text>
          </View>
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

  dniInput: {
    backgroundColor: tokens.colorBG3,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 22,
    color: tokens.colorText,
    letterSpacing: 4,
    fontFamily: fontMono,
    fontWeight: '600',
    minHeight: 62,
  },
  dniInputFocused: {
    borderColor: tokens.colorBrand,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

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

  qrCard: {
    backgroundColor: tokens.colorSurface,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colorLine,
  },
  qrHeaderText: {
    ...type.headline,
    color: tokens.colorSuccess,
  },
  qrImageWrap: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: tokens.colorBG3,
  },
  qr: {
    width: 220,
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
  },
  qrMeta: {
    padding: 16,
    gap: 6,
  },
  qrPlaca: {
    fontSize: 20,
    fontFamily: fontMono,
    color: tokens.colorText,
    fontWeight: '700',
    letterSpacing: 4,
  },
  qrHint: {
    ...type.footnote,
    color: tokens.colorTextSecondary,
    lineHeight: 19,
  },
});
