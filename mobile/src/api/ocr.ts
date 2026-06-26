import { api } from './client';

export async function ocrPlaca(uri: string): Promise<string[]> {
  const form = new FormData();
  form.append('imagen', { uri, name: 'placa.jpg', type: 'image/jpeg' } as unknown as Blob);
  const { data } = await api.post('/ocr/placa', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.candidatas as string[];
}
