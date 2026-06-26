import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { tokens, spacing, radius } from '../src/lib/tokens';
import { toVerdict } from '../src/lib/colores';
import { PlateInput } from '../src/components/PlateInput';
import { Button } from '../src/components/Button';
import { VerdictCard } from '../src/components/VerdictCard';
import { CheckList } from '../src/components/CheckList';
import { verificarPasajero, type Veredicto } from '../src/api/verificar';

export default function Comprador() {
  const [placa, setPlaca] = useState('');
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const verificar = async () => {
    if (!placa.trim()) return;
    setError('');
    setVeredicto(null);
    setCargando(true);
    try {
      setVeredicto(await verificarPasajero(placa.trim().toUpperCase()));
    } catch {
      setError('No pudimos verificar. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verifica antes de comprar</Text>
      <Text style={styles.subtitle}>
        Consulta el historial del vehículo antes de cerrar el trato
      </Text>

      <View style={styles.inputSection}>
        <PlateInput value={placa} onChange={setPlaca} onSubmit={verificar} loading={cargando} />
        <Button onPress={verificar} loading={cargando} disabled={!placa.trim()}>
          Verificar vehículo
        </Button>
      </View>

      {error !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {veredicto && (
        <View style={styles.results}>
          <VerdictCard verdict={toVerdict(veredicto.color)} placa={veredicto.placa} />
          <CheckList checks={veredicto.checks} />
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
