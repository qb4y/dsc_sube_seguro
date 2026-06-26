import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens, spacing, radius } from '../lib/tokens';
import type { ContratoAnalisis } from '../api/verificar';

interface Props {
  analisis: ContratoAnalisis;
}

export function ContratoResult({ analisis }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analisis del contrato</Text>

      {analisis.resumen !== '' && (
        <Text style={styles.resumen}>{analisis.resumen}</Text>
      )}

      {analisis.alertas.length > 0 && (
        <View style={styles.alertasBox}>
          <Text style={styles.alertasTitle}>Alertas encontradas</Text>
          {analisis.alertas.map((alerta, i) => (
            <View key={i} style={styles.alertaRow}>
              <Text style={styles.alertaIcon}>!</Text>
              <Text style={styles.alertaText}>{alerta}</Text>
            </View>
          ))}
        </View>
      )}

      {analisis.alertas.length === 0 && (
        <View style={styles.okBox}>
          <Text style={styles.okText}>No se encontraron clausulas riesgosas</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.lg },
  title: { fontSize: 18, fontWeight: '700', color: tokens.colorText, marginBottom: spacing.sm },
  resumen: { fontSize: 14, color: tokens.colorTextMuted, lineHeight: 20, marginBottom: spacing.md },
  alertasBox: {
    backgroundColor: tokens.colorDanger + '12',
    borderWidth: 1,
    borderColor: tokens.colorDanger + '30',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  alertasTitle: { fontSize: 14, fontWeight: '600', color: tokens.colorDanger, marginBottom: spacing.sm },
  alertaRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  alertaIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colorDanger,
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 8,
    marginTop: 1,
  },
  alertaText: { flex: 1, fontSize: 13, color: tokens.colorText, lineHeight: 19 },
  okBox: {
    backgroundColor: tokens.colorSuccess + '12',
    borderWidth: 1,
    borderColor: tokens.colorSuccess + '30',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  okText: { fontSize: 14, color: tokens.colorSuccess, textAlign: 'center' },
});
