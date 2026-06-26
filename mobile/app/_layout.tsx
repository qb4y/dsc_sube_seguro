import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../src/lib/tokens';

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Math.max(insets.bottom, 16),
            left: 24,
            right: 24,
            backgroundColor: 'rgba(30,30,32,0.75)',
            borderRadius: 22,
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.1)',
            height: 58,
            paddingBottom: 0,
            paddingTop: 0,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
          },
          tabBarActiveTintColor: tokens.colorBrand,
          tabBarInactiveTintColor: 'rgba(235,235,245,0.35)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: 1,
          },
          sceneStyle: { backgroundColor: tokens.colorBackground },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pasajero',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'car' : 'car-outline'} size={21} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="comprador"
          options={{
            title: 'Comprador',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={21} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="conductor"
          options={{
            title: 'Conductor',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'qr-code' : 'qr-code-outline'} size={21} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
