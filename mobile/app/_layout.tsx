import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../src/lib/tokens';

export default function Layout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8;

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: tokens.colorSurface,
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(255,255,255,0.08)',
            height: 56 + bottomPad,
            paddingBottom: bottomPad,
            paddingTop: 6,
            elevation: 0,
          },
          tabBarActiveTintColor: tokens.colorBrand,
          tabBarInactiveTintColor: 'rgba(235,235,245,0.4)',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.1,
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
              <Ionicons name={focused ? 'car' : 'car-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="comprador"
          options={{
            title: 'Comprador',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="conductor"
          options={{
            title: 'Conductor',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'qr-code' : 'qr-code-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
