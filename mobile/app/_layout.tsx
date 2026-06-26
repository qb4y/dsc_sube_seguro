import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../src/lib/tokens';

function TabBarGlass() {
  return (
    <BlurView
      intensity={70}
      tint="systemChromeMaterialDark"
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarBackground: () => <TabBarGlass />,
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom + 12,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(12,12,16,0.35)',
            borderRadius: 28,
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.18)',
            height: 64,
            paddingBottom: 0,
            paddingTop: 0,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.6,
            shadowRadius: 28,
            overflow: 'hidden',
          },
          tabBarItemStyle: { paddingVertical: 10 },
          tabBarActiveTintColor: tokens.colorBrand,
          tabBarInactiveTintColor: 'rgba(235,235,245,0.35)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: 2,
          },
          sceneStyle: { backgroundColor: tokens.colorBackground },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pasajero',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'car' : 'car-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="comprador"
          options={{
            title: 'Comprador',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="conductor"
          options={{
            title: 'Conductor',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'qr-code' : 'qr-code-outline'} size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
