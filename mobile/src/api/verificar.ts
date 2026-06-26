import { api } from './client';
import type { Color } from '../lib/colores';

export interface Check {
  clave: string;
  etiqueta: string;
  color: Color;
  detalle: string;
  fuente: string;
  consultado_en: string;
}

export interface Veredicto {
  color: Color;
  resumen: string;
  placa: string;
  checks: Check[];
}

export async function verificarPasajero(placa: string): Promise<Veredicto> {
  const { data } = await api.post('/verificar/pasajero', { placa });
  return data as Veredicto;
}

export interface ContratoAnalisis {
  alertas: string[];
  resumen: string;
}

export interface CompradorResult {
  veredicto: Veredicto;
  contrato: ContratoAnalisis | null;
}

export async function verificarComprador(
  placa: string,
  contrato?: { uri: string; name: string; type: string },
): Promise<CompradorResult> {
  const form = new FormData();
  form.append('placa', placa);
  if (contrato) {
    form.append('contrato', contrato as unknown as Blob);
  }
  const { data } = await api.post('/verificar/comprador', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as CompradorResult;
}

export async function crearQrConductor(
  placa: string,
  dni: string,
): Promise<{ report_id: string; qr_url: string }> {
  const { data } = await api.post('/conductor/qr', { placa, dni });
  return data;
}
