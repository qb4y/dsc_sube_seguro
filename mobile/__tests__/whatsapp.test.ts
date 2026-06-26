import { construirMensaje, urlWhatsapp } from '../src/lib/whatsapp';

test('mensaje includes placa, descripcion, hora', () => {
  const m = construirMensaje({ placa: 'ABC123', descripcion: 'Toyota Yaris plata', hora: '14:30' });
  expect(m).toContain('ABC123');
  expect(m).toContain('Toyota Yaris plata');
  expect(m).toContain('14:30');
});

test('url encodes the message into wa.me', () => {
  const url = urlWhatsapp('hola mundo');
  expect(url).toBe('https://wa.me/?text=hola%20mundo');
});
