// Ventana de visibilidad de eventos para todos los roles excepto admin:
// solo eventos entre hoy y hoy + 14 días. El admin (en /admin) nunca pasa
// restrictToUpcoming y ve todos los eventos sin límite de fecha.
export const UPCOMING_EVENT_WINDOW_DAYS = 14;

export function getUpcomingEventWindow(): { from: string; to: string } {
  const now = new Date();
  const from = now.toISOString().slice(0, 10);
  const to = new Date(
    now.getTime() + UPCOMING_EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);
  return { from, to };
}
