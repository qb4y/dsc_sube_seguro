import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../src/lib/tokens';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerTitle: 'SubeSeguro',
          headerStyle: { backgroundColor: tokens.colorBackground },
          headerTintColor: tokens.colorText,
          tabBarStyle: {
            backgroundColor: tokens.colorSurface,
            borderTopColor: tokens.colorLine,
          },
          tabBarActiveTintColor: tokens.colorBrand,
          tabBarInactiveTintColor: tokens.colorTextMuted,
          sceneStyle: { backgroundColor: tokens.colorBackground },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pasajero',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="comprador"
          options={{
            title: 'Comprador',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="conductor"
          options={{
            title: 'Conductor',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
