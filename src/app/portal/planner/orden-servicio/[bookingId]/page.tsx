import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlannerOrdenForm } from "@/components/portal/orden-servicio/PlannerOrdenForm";

export default async function PlannerOrdenPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "wedding_planner"].includes(profile.role)) {
    redirect("/portal/dashboard");
  }

  // Fetch booking + perfil del cliente
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `id, event_type, event_date, event_start_time, event_end_time,
       guest_count, status, notes,
       profiles (full_name, email)`
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) notFound();

  const clientProfile = booking.profiles as {
    full_name: string | null;
    email: string;
  } | null;

  // Fetch secciones + items
  const { data: sections } = await supabase
    .from("service_order_sections")
    .select(
      `id, name, sort_order,
       service_order_items (
         id, label, value, item_type, options, sort_order, filled_by
       )`
    )
    .eq("booking_id", bookingId)
    .order("sort_order")
    .order("sort_order", { referencedTable: "service_order_items" });

  // Playlist del cliente (fuente de los campos musicales de solo lectura)
  const { data: playlist } = await supabase
    .from("playlists")
    .select("section, song_url, no_aplica")
    .eq("booking_id", bookingId);

  const eventTypeLabel: Record<string, string> = {
    boda: "Boda",
    quince: "Quinceañera",
    empresarial: "Empresarial",
    revelacion: "Revelación de Género",
  };

  const pageTitle =
    clientProfile?.full_name ??
    clientProfile?.email ??
    "Cliente";

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div>
        <Link
          href="/portal/planner"
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-gris hover:text-negro transition-colors mb-3"
        >
          <ArrowLeft size={13} />
          Volver al panel
        </Link>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Orden de{" "}
          <span className="text-dorado">
            {eventTypeLabel[booking.event_type ?? ""] ?? "Evento"}
          </span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">{pageTitle}</p>
      </div>

      {/* Formulario */}
      <PlannerOrdenForm
        booking={{
          id: booking.id,
          event_type: booking.event_type,
          event_date: booking.event_date,
          guest_count: booking.guest_count,
          status: booking.status,
          notes: booking.notes,
          client_name: clientProfile?.full_name ?? clientProfile?.email ?? null,
        }}
        sections={
          (sections ?? []) as Parameters<
            typeof PlannerOrdenForm
          >[0]["sections"]
        }
        playlist={
          (playlist ?? []) as Parameters<typeof PlannerOrdenForm>[0]["playlist"]
        }
      />
    </div>
  );
}
