import { api } from '../src/api/client';
import { verificarPasajero } from '../src/api/verificar';

jest.mock('../src/api/client', () => ({
  api: { post: jest.fn() },
}));

test('verificarPasajero posts placa and returns veredicto', async () => {
  (api.post as jest.Mock).mockResolvedValue({
    data: { color: 'rojo', resumen: 'Riesgo', placa: 'ABC123', checks: [] },
  });
  const v = await verificarPasajero('ABC123');
  expect(api.post).toHaveBeenCalledWith('/verificar/pasajero', { placa: 'ABC123' });
  expect(v.color).toBe('rojo');
});
