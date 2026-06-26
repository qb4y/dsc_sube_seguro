/**
 * React Native adaptation of design-system PlateInput.
 * Matches DS props: value, onChange, onSubmit, loading, placeholder
 */
import React from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { tokens } from '../lib/tokens';
import { spacing, radius, fontMono, colorPlateBlueSidebar } from '../lib/tokens';

export interface PlateInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function PlateInput({ value, onChange, onSubmit, loading = false, placeholder = 'ABC123' }: PlateInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarText}>PE</Text>
      </View>
      <TextInput
        testID="plate-input"
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={tokens.colorTextMuted}
        autoCapitalize="characters"
        maxLength={8}
        editable={!loading}
        returnKeyType="search"
      />
      {loading && <ActivityIndicator color={tokens.colorBrand} style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colorSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    overflow: 'hidden',
  },
  sidebar: {
    backgroundColor: colorPlateBlueSidebar,
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  input: {
    flex: 1,
    color: tokens.colorText,
    fontSize: 26,
    fontFamily: fontMono,
    letterSpacing: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  loader: { marginRight: spacing.md },
});
