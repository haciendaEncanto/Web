// Ventana de visibilidad de eventos para planner/staff/asesor comercial/
// asesor logística: solo eventos entre hoy y hoy + 15 días. Admin y
// gerente nunca pasan restrictToUpcoming y ven todos los eventos sin
// límite de fecha.
export const UPCOMING_EVENT_WINDOW_DAYS = 15;

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
