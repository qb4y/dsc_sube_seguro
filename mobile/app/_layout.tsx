import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
        <Tabs.Screen name="index" options={{ title: '🚕 Pasajero' }} />
        <Tabs.Screen name="comprador" options={{ title: '🛒 Comprador' }} />
        <Tabs.Screen name="conductor" options={{ title: '🪪 Conductor' }} />
      </Tabs>
    </>
  );
}
