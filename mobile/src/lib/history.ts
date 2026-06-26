import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Veredicto } from '../api/verificar';

const KEY = 'subeseguro:historial';
const MAX = 20;

export interface HistorialEntry {
  id: string;
  placa: string;
  color: 'verde' | 'ambar' | 'rojo';
  resumen: string;
  fechaIso: string;
}

function fromVeredicto(v: Veredicto): HistorialEntry {
  return {
    id: `${v.placa}-${Date.now()}`,
    placa: v.placa,
    color: v.color as HistorialEntry['color'],
    resumen: v.resumen,
    fechaIso: new Date().toISOString(),
  };
}

export async function guardarVerificacion(v: Veredicto): Promise<void> {
  try {
    const existing = await cargarHistorial();
    const entry = fromVeredicto(v);
    const updated = [entry, ...existing.filter((e) => e.placa !== v.placa)].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // silently ignore storage errors
  }
}

export async function cargarHistorial(): Promise<HistorialEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistorialEntry[];
  } catch {
    return [];
  }
}

export async function borrarEntrada(id: string): Promise<HistorialEntry[]> {
  const existing = await cargarHistorial();
  const updated = existing.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export async function borrarHistorial(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export function formatFecha(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}
