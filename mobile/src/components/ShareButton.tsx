/**
 * React Native adaptation of design-system ShareButton.
 * Matches DS props: shareUrl (built internally), shared, onClick→onPress
 */
import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { tokens, radius, spacing, colorWhatsApp } from '../lib/tokens';
import { construirMensaje, urlWhatsapp } from '../lib/whatsapp';

export interface ShareButtonProps {
  placa: string;
  descripcion: string;
  hora: string;
}

export function ShareButton({ placa, descripcion, hora }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const onPress = () => {
    const url = urlWhatsapp(construirMensaje({ placa, descripcion, hora }));
    Linking.openURL(url);
    setShared(true);
  };

  return (
    <Pressable
      testID="share-button"
      style={[styles.btn, shared && styles.btnShared]}
      onPress={onPress}
    >
      <Text style={[styles.text, shared && styles.textShared]}>
        {shared ? '✓ Viaje compartido' : '📲 Comparte tu viaje'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colorWhatsApp,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnShared: { backgroundColor: tokens.colorSurfaceElevated },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  textShared: { color: tokens.colorTextMuted },
});
