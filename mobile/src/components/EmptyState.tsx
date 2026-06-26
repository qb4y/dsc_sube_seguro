import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens, radius, type } from '../lib/tokens';
import { useFadeSlideIn, usePulse } from '../lib/animations';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const anim = useFadeSlideIn(120, 16);
  const iconOpacity = usePulse();

  return (
    <Animated.View style={[styles.container, anim]}>
      <Animated.View style={[styles.iconWrap, { opacity: iconOpacity }]}>
        <Ionicons name={icon} size={44} color={tokens.colorTextMuted} />
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 40 },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: 'rgba(28,28,30,0.8)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  title: {
    ...type.headline,
    color: tokens.colorTextSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...type.subheadline,
    color: tokens.colorTextMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
