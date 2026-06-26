export function construirMensaje(p: {
  placa: string;
  descripcion: string;
  hora: string;
}): string {
  return (
    `🚗 Estoy tomando este vehículo:\n` +
    `Placa: ${p.placa}\n` +
    `Vehículo: ${p.descripcion}\n` +
    `Hora: ${p.hora}\n` +
    `(Enviado con SubeSeguro)`
  );
}

export function urlWhatsapp(mensaje: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
}
