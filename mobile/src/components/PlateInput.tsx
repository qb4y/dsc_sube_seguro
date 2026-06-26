import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text, Pressable } from 'react-native';
import { tokens, radius, fontMono, colorPlateBlueSidebar, type } from '../lib/tokens';

export interface PlateInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function PlateInput({
  value, onChange, onSubmit, loading = false, placeholder = 'ABC-123',
}: PlateInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.wrapper}>
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
        ]}
      >
        <View style={styles.sidebar}>
          <Text style={styles.sidebarFlag}>🇵🇪</Text>
          <Text style={styles.sidebarText}>PE</Text>
        </View>

        <TextInput
          ref={inputRef}
          testID="plate-input"
          style={styles.input}
          value={value}
          onChangeText={(t) =>
            onChange(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))
          }
          onSubmitEditing={onSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={tokens.colorTextMuted}
          autoCapitalize="characters"
          maxLength={8}
          editable={!loading}
          returnKeyType="search"
          selectionColor={tokens.colorBrand}
        />

        {loading && (
          <ActivityIndicator color={tokens.colorBrand} style={styles.loader} size="small" />
        )}
      </View>

      <Text style={styles.hint}>Ingresa hasta 8 caracteres</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colorSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: tokens.colorLine,
    overflow: 'hidden',
    minHeight: 62,
  },
  containerFocused: {
    borderColor: tokens.colorBrand,
    shadowColor: tokens.colorBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sidebar: {
    backgroundColor: colorPlateBlueSidebar,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 2,
  },
  sidebarFlag: { fontSize: 16 },
  sidebarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  input: {
    flex: 1,
    color: tokens.colorText,
    fontSize: 28,
    fontFamily: fontMono,
    letterSpacing: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontWeight: '700',
  },
  loader: { marginRight: 16 },
  hint: {
    ...type.caption2,
    color: tokens.colorTextMuted,
    marginLeft: 4,
  },
});
