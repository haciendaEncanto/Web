// CallMeBot WhatsApp notification utility — fire and forget.
// Usa el número central si CALLMEBOT_API_KEY_CENTRAL está configurada;
// de lo contrario usa el número de prueba. Nunca bloquea al usuario.
export async function sendWhatsAppNotification(message: string): Promise<void> {
  const hasCentral =
    process.env.CALLMEBOT_PHONE_CENTRAL && process.env.CALLMEBOT_API_KEY_CENTRAL;

  const phone = hasCentral
    ? process.env.CALLMEBOT_PHONE_CENTRAL!
    : process.env.CALLMEBOT_PHONE;
  const apiKey = hasCentral
    ? process.env.CALLMEBOT_API_KEY_CENTRAL!
    : process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) return;

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", message);
  url.searchParams.set("apikey", apiKey);

  await fetch(url.toString()).catch(() => {
    // Fallo silencioso — CallMeBot nunca debe bloquear el flujo del usuario
  });
}
