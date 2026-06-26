import React, { useState } from 'react';
import { Animated, Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { tokens, radius, type, colorWhatsApp } from '../lib/tokens';
import { useSpringPress } from '../lib/animations';
import { construirMensaje, urlWhatsapp } from '../lib/whatsapp';

export interface ShareButtonProps {
  placa: string;
  descripcion: string;
  hora: string;
}

export function ShareButton({ placa, descripcion, hora }: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const { scale, onPressIn, onPressOut } = useSpringPress();

  const onPress = () => {
    const url = urlWhatsapp(construirMensaje({ placa, descripcion, hora }));
    Linking.openURL(url);
    setShared(true);
  };

  return (
    <Pressable
      testID="share-button"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.btn, shared && styles.btnShared, { transform: [{ scale }] }]}>
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
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colorWhatsApp,
    borderRadius: radius.xl,
    marginTop: 12,
    shadowColor: colorWhatsApp,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  btnShared: {
    backgroundColor: tokens.colorSurface,
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    shadowOpacity: 0,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  text: { ...type.headline, color: '#FFFFFF', fontWeight: '700' },
  textShared: { color: tokens.colorTextMuted },
});
