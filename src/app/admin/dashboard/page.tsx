import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users, Mail, MessageSquare, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Empresarial",
  revelacion: "Revelación de Género",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function formatTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "pm" : "am"}`;
}

function KPI({ label, value, icon: Icon, sub }: {
  label: string; value: number | string; icon: React.ElementType; sub?: string;
}) {
  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] text-gris uppercase tracking-wider mb-1">{label}</p>
          <p className="font-serif text-[2.2rem] text-negro leading-none">{value}</p>
          {sub && <p className="text-[0.75rem] text-gris mt-1.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-dorado/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-dorado" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const monthStart = firstOfMonth.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalActivos },
    { count: eventosEsteMes },
    { count: contactosNuevos },
    { count: sinLeer },
    { data: proximosEventos },
    { data: contactosRecientes },
  ] = await Promise.all([
    admin.from("bookings").select("*", { count: "exact", head: true })
      .neq("status", "cancelled").gte("event_date", today),
    admin.from("bookings").select("*", { count: "exact", head: true })
      .neq("status", "cancelled").gte("event_date", monthStart),
    admin.from("contact_messages").select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    admin.from("contact_messages").select("*", { count: "exact", head: true })
      .eq("status", "unread"),
    admin.from("bookings")
      .select("id, event_type, event_date, event_start_time, profiles(full_name, email)")
      .neq("status", "cancelled")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(6),
    admin.from("contact_messages")
      .select("id, name, email, subject, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  type ProximoEvento = {
    id: string;
    event_type: string | null;
    event_date: string | null;
    event_start_time: string | null;
    profiles: { full_name: string | null; email: string } | null;
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Panel de <span className="text-dorado">administración</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">Vista general del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Eventos activos" value={totalActivos ?? 0} icon={CalendarDays}
          sub="desde hoy en adelante" />
        <KPI label="Eventos este mes" value={eventosEsteMes ?? 0} icon={Clock}
          sub="mes en curso" />
        <KPI label="Contactos nuevos" value={contactosNuevos ?? 0} icon={Mail}
          sub="últimos 7 días" />
        <KPI label="Sin leer" value={sinLeer ?? 0} icon={MessageSquare}
          sub="formulario contacto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos eventos */}
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30 flex items-center justify-between">
            <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">Próximos eventos</h3>
            <Link href="/portal/planner/clientes"
              className="text-[0.75rem] text-dorado hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-negro/[0.04]">
            {!proximosEventos?.length ? (
              <p className="px-6 py-8 text-[0.85rem] text-gris text-center">Sin eventos próximos</p>
            ) : (
              (proximosEventos as unknown as ProximoEvento[]).map((b) => (
                <div key={b.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.85rem] font-medium text-negro truncate leading-tight">
                      {(b.profiles as { full_name: string | null; email: string } | null)?.full_name ?? b.profiles?.email ?? "Cliente"}
                    </p>
                    <p className="text-[0.75rem] text-gris mt-0.5">
                      {EVENT_LABEL[b.event_type ?? ""] ?? b.event_type ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[0.8rem] text-negro font-medium">{formatDate(b.event_date)}</p>
                    <p className="text-[0.73rem] text-gris">{formatTime(b.event_start_time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contactos recientes */}
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
            <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">Contactos recientes</h3>
          </div>
          <div className="divide-y divide-negro/[0.04]">
            {!contactosRecientes?.length ? (
              <p className="px-6 py-8 text-[0.85rem] text-gris text-center">Sin contactos recientes</p>
            ) : (
              contactosRecientes.map((c) => (
                <div key={c.id} className="px-6 py-3.5 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[0.85rem] font-medium text-negro truncate">{c.name}</p>
                      {c.status === "unread" && (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-dorado" />
                      )}
                    </div>
                    <p className="text-[0.74rem] text-gris truncate">{c.subject ?? c.email}</p>
                  </div>
                  <p className="text-[0.72rem] text-gris/60 shrink-0 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
