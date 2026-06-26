import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { tokens, spacing, radius } from '../src/lib/tokens';
import { toVerdict } from '../src/lib/colores';
import { PlateInput } from '../src/components/PlateInput';
import { Button } from '../src/components/Button';
import { VerdictCard } from '../src/components/VerdictCard';
import { CheckList } from '../src/components/CheckList';
import { ContratoResult } from '../src/components/ContratoResult';
import { EmptyState } from '../src/components/EmptyState';
import {
  verificarComprador,
  type CompradorResult,
  type ContratoAnalisis,
} from '../src/api/verificar';

export default function Comprador() {
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState<CompradorResult | null>(null);
  const [archivo, setArchivo] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const seleccionarContrato = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setArchivo({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? 'application/octet-stream',
        });
      }
    } catch {
      // usuario cancelo
    }
  };

  const verificar = async () => {
    if (!placa.trim()) return;
    setError('');
    setResultado(null);
    setCargando(true);
    try {
      const data = await verificarComprador(
        placa.trim().toUpperCase(),
        archivo ?? undefined,
      );
      setResultado(data);
      Haptics.notificationAsync(
        data.veredicto.color === 'verde'
          ? Haptics.NotificationFeedbackType.Success
          : data.veredicto.color === 'rojo'
            ? Haptics.NotificationFeedbackType.Error
            : Haptics.NotificationFeedbackType.Warning,
      );
    } catch {
      setError('No pudimos verificar. Revisa tu conexion.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verifica antes de comprar</Text>
      <Text style={styles.subtitle}>
        Consulta el historial del vehiculo y analiza el contrato antes de cerrar el trato
      </Text>

      <View style={styles.inputSection}>
        <PlateInput value={placa} onChange={setPlaca} onSubmit={verificar} loading={cargando} />

        <Button onPress={seleccionarContrato} variant="ghost" disabled={cargando}>
          {archivo ? `Contrato: ${archivo.name}` : 'Adjuntar contrato (opcional)'}
        </Button>

        <Button onPress={verificar} loading={cargando} disabled={!placa.trim()}>
          Verificar vehiculo
        </Button>
      </View>

      {error !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!resultado && !cargando && !error && (
        <EmptyState
          icon="document-text-outline"
          title="Verifica el vehiculo y su contrato"
          subtitle="Analiza clausulas riesgosas con inteligencia artificial antes de firmar"
        />
      )}

      {resultado && (
        <View style={styles.results}>
          <VerdictCard verdict={toVerdict(resultado.veredicto.color)} placa={resultado.veredicto.placa} />
          <CheckList checks={resultado.veredicto.checks} />
          {resultado.contrato && <ContratoResult analisis={resultado.contrato} />}
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
  errorBox: { backgroundColor: tokens.colorDanger + '15', padding: 12, borderRadius: radius.sm, marginTop: spacing.md },
  errorText: { color: tokens.colorDanger, fontSize: 14 },
  results: { marginTop: spacing.lg },
});
