import { redirect } from "next/navigation";
import { CalendarDays, Clock, MapPin, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default async function ActividadesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener el booking del cliente
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("client_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Marcar notificaciones de actividades como leídas
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("type", "new_activity")
    .eq("is_read", false);

  const today = new Date().toISOString().split("T")[0];

  const { data: actividades } = booking
    ? await supabase
        .from("client_activities")
        .select("*")
        .eq("booking_id", booking.id)
        .order("activity_date", { ascending: true })
        .order("activity_time", { ascending: true })
    : { data: [] };

  const upcoming = (actividades ?? []).filter((a) => a.activity_date >= today);
  const past = (actividades ?? []).filter((a) => a.activity_date < today);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Cabecera */}
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Mi <span className="text-dorado">Agenda</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Actividades programadas por tu wedding planner
        </p>
      </div>

      {!booking ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
          <CalendarDays size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro">Sin agenda activa</p>
        </div>
      ) : actividades?.length === 0 ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
          <CalendarDays size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro mb-2">
            Aún no hay actividades programadas
          </p>
          <p className="text-gris text-[0.85rem]">
            Tu wedding planner irá agregando las citas y actividades previas a tu
            evento.
          </p>
        </div>
      ) : (
        <>
          {/* Próximas actividades */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="font-serif text-[1.1rem] text-negro mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-dorado inline-block" />
                Próximas actividades
              </h3>
              <div className="space-y-3">
                {upcoming.map((act) => (
                  <div
                    key={act.id}
                    className="bg-blanco border border-dorado/20 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="font-serif text-[1.05rem] text-negro leading-tight">
                        {act.title}
                      </h4>
                      {act.activity_date === today && (
                        <span className="shrink-0 text-[0.65rem] font-medium px-2.5 py-0.5 rounded-full bg-dorado/15 text-dorado border border-dorado/30 uppercase tracking-wider">
                          Hoy
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8rem] text-gris">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-dorado/60" />
                        {formatDate(act.activity_date)}
                      </span>
                      {act.activity_time && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-dorado/60" />
                          {formatTime(act.activity_time)}
                        </span>
                      )}
                      {act.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-dorado/60" />
                          {act.location}
                        </span>
                      )}
                    </div>
                    {act.notes && (
                      <div className="mt-3 flex items-start gap-2 text-[0.8rem] text-gris bg-crema/50 rounded-xl px-3 py-2.5">
                        <FileText size={13} className="text-gris/50 shrink-0 mt-0.5" />
                        <span>{act.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actividades pasadas */}
          {past.length > 0 && (
            <div>
              <h3 className="font-serif text-[1.1rem] text-gris mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-negro/20 inline-block" />
                Actividades realizadas
              </h3>
              <div className="space-y-3 opacity-60">
                {[...past].reverse().map((act) => (
                  <div
                    key={act.id}
                    className="bg-blanco border border-negro/[0.07] rounded-2xl p-5"
                  >
                    <h4 className="text-[0.9rem] font-medium text-negro mb-2 line-through decoration-negro/30">
                      {act.title}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-gris">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        {formatDate(act.activity_date)}
                      </span>
                      {act.activity_time && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {formatTime(act.activity_time)}
                        </span>
                      )}
                      {act.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {act.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
