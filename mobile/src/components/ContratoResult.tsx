import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens, radius, type } from '../lib/tokens';
import type { ContratoAnalisis } from '../api/verificar';

interface Props {
  analisis: ContratoAnalisis;
}

export function ContratoResult({ analisis }: Props) {
  const clean = analisis.alertas.length === 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Análisis del contrato</Text>

      {analisis.resumen !== '' && (
        <View style={styles.resumenCard}>
          <Text style={styles.resumen}>{analisis.resumen}</Text>
        </View>
      )}

      {clean ? (
        <View style={styles.okCard}>
          <Ionicons name="checkmark-circle" size={20} color={tokens.colorSuccess} />
          <Text style={styles.okText}>Sin cláusulas riesgosas detectadas</Text>
        </View>
      ) : (
        <View style={styles.alertasCard}>
          <View style={styles.alertasHeader}>
            <Ionicons name="warning" size={16} color={tokens.colorDanger} />
            <Text style={styles.alertasTitle}>{analisis.alertas.length} alerta{analisis.alertas.length !== 1 ? 's' : ''} encontrada{analisis.alertas.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.alertasSep} />
          {analisis.alertas.map((alerta, i) => (
            <View key={i} style={[styles.alertaRow, i < analisis.alertas.length - 1 && styles.alertaRowBorder]}>
              <View style={styles.alertaBullet}>
                <Text style={styles.alertaBulletText}>{i + 1}</Text>
              </View>
              <Text style={styles.alertaText}>{alerta}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8 },
  sectionTitle: {
    ...type.footnote,
    color: tokens.colorTextMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  resumenCard: {
    backgroundColor: tokens.colorSurface,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  resumen: {
    ...type.subheadline,
    color: tokens.colorTextSecondary,
    lineHeight: 22,
  },
  okCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(48,209,88,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(48,209,88,0.3)',
    borderRadius: radius.lg,
    padding: 16,
  },
  okText: {
    ...type.subheadline,
    color: tokens.colorSuccess,
    fontWeight: '600',
  },
  alertasCard: {
    backgroundColor: 'rgba(255,69,58,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,69,58,0.28)',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  alertasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    paddingHorizontal: 16,
  },
  alertasTitle: {
    ...type.subheadline,
    color: tokens.colorDanger,
    fontWeight: '700',
  },
  alertasSep: {
    height: 0.5,
    backgroundColor: 'rgba(255,69,58,0.2)',
  },
  alertaRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  alertaRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,69,58,0.2)',
  },
  alertaBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colorDanger,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  alertaBulletText: {
    ...type.caption2,
    color: '#fff',
    fontWeight: '800',
  },
  alertaText: {
    flex: 1,
    ...type.footnote,
    color: tokens.colorText,
    lineHeight: 19,
  },
});
