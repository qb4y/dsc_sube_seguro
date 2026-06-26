import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { tokens, radius, type, colorWhatsApp } from '../lib/tokens';
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
      style={({ pressed }) => [
        styles.btn,
        shared && styles.btnShared,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.inner}>
        <Ionicons
          name={shared ? 'checkmark-circle' : 'logo-whatsapp'}
          size={20}
          color={shared ? tokens.colorTextMuted : '#fff'}
        />
        <Text style={[styles.text, shared && styles.textShared]}>
          {shared ? 'Viaje compartido' : 'Compartir viaje por WhatsApp'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colorWhatsApp,
    borderRadius: radius.xl,
    minHeight: 52,
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colorWhatsApp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  btnShared: {
    backgroundColor: tokens.colorSurface,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    shadowOpacity: 0,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
  },
  text: { ...type.headline, color: '#FFFFFF', fontWeight: '700' },
  textShared: { color: tokens.colorTextMuted },
});
