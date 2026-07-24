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

  console.log("[callmebot] vars:", {
    hasCentral: !!hasCentral,
    phone: phone ? `${phone.slice(0, 4)}***${phone.slice(-3)}` : "MISSING",
    apiKey: apiKey ? `${apiKey.slice(0, 3)}***` : "MISSING",
  });

  if (!phone || !apiKey) {
    console.log("[callmebot] abortando — faltan credenciales");
    return;
  }

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", message);
  url.searchParams.set("apikey", apiKey);

  try {
    const res = await fetch(url.toString());
    const body = await res.text();
    console.log("[callmebot] status:", res.status, "| body:", body.slice(0, 300));
  } catch (err) {
    console.log("[callmebot] fetch error:", err instanceof Error ? err.message : err);
  }
}
