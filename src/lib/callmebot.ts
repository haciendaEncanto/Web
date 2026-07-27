// CallMeBot WhatsApp notification utility — fire and forget.
// Nunca bloquea al usuario. Todas las funciones son void.

async function callMeBot(phone: string, apiKey: string, message: string, label: string): Promise<void> {
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", message);
  url.searchParams.set("apikey", apiKey);
  try {
    const res = await fetch(url.toString());
    const body = await res.text();
    console.log(`[callmebot] ${label} status:`, res.status, "| body:", body.slice(0, 300));
  } catch (err) {
    console.log(`[callmebot] ${label} error:`, err instanceof Error ? err.message : err);
  }
}

// Envía al número central (usa central si está configurada, de lo contrario al de prueba).
export async function sendWhatsAppNotification(message: string): Promise<void> {
  const hasCentral =
    process.env.CALLMEBOT_PHONE_CENTRAL && process.env.CALLMEBOT_API_KEY_CENTRAL;

  const phone = hasCentral
    ? process.env.CALLMEBOT_PHONE_CENTRAL!
    : process.env.CALLMEBOT_PHONE;
  const apiKey = hasCentral
    ? process.env.CALLMEBOT_API_KEY_CENTRAL!
    : process.env.CALLMEBOT_API_KEY;

  console.log("[callmebot] vars:", {
    hasCentral: !!hasCentral,
    phone: phone ? `${phone.slice(0, 4)}***${phone.slice(-3)}` : "MISSING",
    apiKey: apiKey ? `${apiKey.slice(0, 3)}***` : "MISSING",
  });

  if (!phone || !apiKey) {
    console.log("[callmebot] abortando — faltan credenciales");
    return;
  }

  await callMeBot(phone, apiKey, message, "central");
}

// Envía directamente al número personal de un asesor (requiere su API key registrada en CallMeBot).
export async function sendWhatsAppToPhone(
  phone: string,
  apiKey: string,
  message: string
): Promise<void> {
  await callMeBot(phone, apiKey, message, `asesor-${phone.slice(-4)}`);
}
