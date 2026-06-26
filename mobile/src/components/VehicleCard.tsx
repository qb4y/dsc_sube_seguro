import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens, verdictColors, radius, type } from '../lib/tokens';
import { MatchConfirm } from './ChoiceButton';

export interface VehicleInfo {
  marca: string;
  modelo: string;
  color: string;
}

export interface VehicleCardProps {
  vehicle: VehicleInfo;
  match: boolean | null;
  onMatch: (v: boolean) => void;
}

export function VehicleCard({ vehicle, match, onMatch }: VehicleCardProps) {
  const overlayScale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (match !== null) {
      Animated.parallel([
        Animated.spring(overlayScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      overlayScale.setValue(0);
      overlayOpacity.setValue(0);
      borderAnim.setValue(0);
    }
  }, [match]);

  const isMatch = match === true;
  const isNoMatch = match === false;
  const accentColor = isMatch ? tokens.colorSuccess : isNoMatch ? tokens.colorDanger : tokens.colorLine;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colorLine, accentColor],
  });

  return (
    <Animated.View style={[styles.card, { borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, match !== null && { backgroundColor: accentColor + '22' }]}>
          <Ionicons
            name={match === null ? 'car' : isMatch ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={match === null ? tokens.colorBrand : accentColor}
          />
        </View>
        <Text style={styles.headerTitle}>Datos del vehículo</Text>
        {match !== null && (
          <Animated.View
            style={[
              styles.matchBadge,
              { backgroundColor: accentColor + '22', borderColor: accentColor + '55' },
              { transform: [{ scale: overlayScale }], opacity: overlayOpacity },
            ]}
          >
            <Text style={[styles.matchBadgeText, { color: accentColor }]}>
              {isMatch ? 'Coincide' : 'No coincide'}
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.separator} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Marca</Text>
        <Text style={styles.detailValue}>{vehicle.marca || '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Modelo</Text>
        <Text style={styles.detailValue}>{vehicle.modelo || '—'}</Text>
      </View>
      <View style={[styles.detailRow, styles.lastDetail]}>
        <Text style={styles.detailLabel}>Color</Text>
        <Text style={styles.detailValue}>{vehicle.color || '—'}</Text>
      </View>

      <View style={styles.separator} />

      {match === null ? (
        <>
          <Text style={styles.question}>¿Coincide con el vehículo que ves?</Text>
          <MatchConfirm value={match} onChange={onMatch} />
        </>
      ) : (
        /* Confirmation overlay — replaces buttons after selection */
        <Animated.View
          style={[
            styles.confirmOverlay,
            isMatch ? styles.confirmGreen : styles.confirmRed,
            { transform: [{ scale: overlayScale }], opacity: overlayOpacity },
          ]}
        >
          <Animated.View style={[styles.confirmIconRing, { backgroundColor: accentColor + '22', borderColor: accentColor + '44' }]}>
            <Ionicons
              name={isMatch ? 'checkmark' : 'close'}
              size={32}
              color={accentColor}
            />
          </Animated.View>
          <Text style={[styles.confirmTitle, { color: accentColor }]}>
            {isMatch ? '¡Vehículo confirmado!' : 'Vehículo no coincide'}
          </Text>
          <Text style={styles.confirmSub}>
            {isMatch
              ? 'Los datos del vehículo coinciden con lo que ves.'
              : 'Atención: podría ser placa clonada. Considera no subir.'}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colorSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: tokens.colorBrandTint,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...type.headline, color: tokens.colorText, flex: 1 },
  matchBadge: {
    borderRadius: radius.pill,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchBadgeText: { fontSize: 12, fontWeight: '700' },
  separator: { height: 0.5, backgroundColor: tokens.colorLine },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colorLine,
  },
  lastDetail: { borderBottomWidth: 0 },
  detailLabel: { ...type.subheadline, color: tokens.colorTextSecondary },
  detailValue: { ...type.subheadline, color: tokens.colorText, fontWeight: '600' },
  question: {
    ...type.footnote, color: tokens.colorTextMuted,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  // Confirmation state
  confirmOverlay: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 10,
  },
  confirmGreen: { backgroundColor: 'rgba(48,209,88,0.06)' },
  confirmRed: { backgroundColor: 'rgba(255,69,58,0.06)' },
  confirmIconRing: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  confirmTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  confirmSub: {
    ...type.footnote,
    color: tokens.colorTextSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
});
