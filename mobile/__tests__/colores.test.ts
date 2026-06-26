import { estilo, toVerdict } from '../src/lib/colores';

test('verde maps to green style', () => {
  expect(estilo('verde').emoji).toBe('🟢');
  expect(estilo('verde').etiqueta).toBe('Seguro');
});

test('rojo maps to red style', () => {
  expect(estilo('rojo').emoji).toBe('🔴');
});

test('desconocido falls back to amber', () => {
  expect(estilo('desconocido').emoji).toBe('🟡');
});

test('toVerdict converts backend Color to DS VerdictColor', () => {
  expect(toVerdict('verde')).toBe('green');
  expect(toVerdict('ambar')).toBe('amber');
  expect(toVerdict('rojo')).toBe('red');
  expect(toVerdict('desconocido')).toBe('amber');
});
