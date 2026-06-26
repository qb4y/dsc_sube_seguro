import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../src/lib/tokens';
import * as QuickActions from 'expo-quick-actions';

export default function Layout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Set up quick actions (long press on app icon)
  useEffect(() => {
    QuickActions.setItems([
      {
        id: 'verificar_camara',
        title: 'Escanear placa',
        subtitle: 'Usar cámara para leer la placa',
        icon: 'capturePhoto',
      },
      {
        id: 'verificar_qr',
        title: 'Escanear QR',
        subtitle: 'Escanear QR del conductor',
        icon: 'search',
      },
      {
        id: 'verificar_manual',
        title: 'Ingresar placa',
        subtitle: 'Escribir la placa manualmente',
        icon: 'compose',
      },
    ]);
  }, []);

  // Listen for quick action taps
  useEffect(() => {
    // Handle action that launched the app
    if (QuickActions.initial) {
      handleQuickAction(QuickActions.initial);
    }

    const sub = QuickActions.addListener((action) => {
      handleQuickAction(action);
    });

    return () => sub.remove();
  }, []);

  function handleQuickAction(action: QuickActions.Action) {
    switch (action.id) {
      case 'verificar_camara':
        router.push({ pathname: '/', params: { action: 'camera' } });
        break;
      case 'verificar_qr':
        router.push({ pathname: '/', params: { action: 'qr' } });
        break;
      case 'verificar_manual':
        router.push({ pathname: '/' });
        break;
    }
  }

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Math.max(insets.bottom, 12),
            left: 20,
            right: 20,
            backgroundColor: 'rgba(28,28,30,0.92)',
            borderRadius: 20,
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.12)',
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(255,255,255,0.12)',
            height: 52,
            paddingBottom: 0,
            paddingTop: 0,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
          },
          tabBarItemStyle: {
            height: 52,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 0,
            paddingBottom: 0,
          },
          tabBarIconStyle: {
            marginTop: 0,
            marginBottom: 0,
          },
          tabBarActiveTintColor: tokens.colorBrand,
          tabBarInactiveTintColor: 'rgba(235,235,245,0.35)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: -2,
            marginBottom: 4,
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
        <Tabs.Screen
          name="historial"
          options={{
            title: 'Historial',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
