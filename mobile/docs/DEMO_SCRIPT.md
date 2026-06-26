# Demo — SubeSeguro

Guion de 90 segundos para el jurado.

1. **El gancho.** "Vas a tomar un taxi. ¿Está asegurado? ¿Es el auto real? Hoy nadie lo verifica." Abro la app, pestaña **Pasajero**.
2. **La consulta.** Escribo (o **fotografío**) la placa → toco **Verificar**.
3. **El veredicto (≈5s).** Aparece el semáforo 🟢/🟡/🔴 + detalle por fuente (SOAT, vehículo, revisión técnica) con timestamp.
4. **Caso 🔴.** "Este taxi tiene el SOAT vencido — no subo."
5. **Función estrella.** Toco **"Comparte tu viaje"** → WhatsApp abre con placa + descripción verificada del auto + hora, listo para enviar a un contacto de confianza.
6. **Conductor.** Pestaña **Conductor**: el taxista genera su **QR de conductor verificado** que re-consulta en tiempo real al escanear.
7. **Cierre.** "Seguridad vial en un gesto de 5 segundos, gratis, desde cualquier celular."

---

## Preparación

- **Backend** corriendo: `uvicorn app.main:app --port 8000`.
- **Mobile**: `EXPO_PUBLIC_API_URL=http://<IP-LAN>:8000 npx expo start`.
- **Casos de prueba:** tener a mano una placa con SOAT **vigente** (🟢) y una con SOAT **vencido** (🔴).
- **Backup:** grabar un video de la demo por si falla la red en vivo.

---

## Una línea de pitch

> *"Revisa antes de subir: en 5 segundos sabes si el auto está asegurado, si es el auto real, y tu familia sabe en cuál estás."*
