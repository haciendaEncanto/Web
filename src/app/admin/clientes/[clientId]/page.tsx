import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClienteEditForm } from "@/components/portal/planner/ClienteEditForm";
import { PlannerOrdenForm } from "@/components/portal/orden-servicio/PlannerOrdenForm";
import { DEFAULT_CONTRACT_ITEMS } from "@/lib/contract-items";

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function AdminClienteDetailPage({ params }: Props) {
  const { clientId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role !== "admin") redirect("/portal");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, address, cc")
    .eq("id", clientId)
    .single();

  if (!profile) notFound();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `id, event_type, event_date, event_start_time, event_end_time,
       guest_count, status, notes, valor_total, valor_anticipo,
       fecha_segundo_abono, fecha_tercer_abono, capilla, contract_items`,
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!booking) notFound();

  const { data: sections } = await supabase
    .from("service_order_sections")
    .select(
      `id, name, sort_order,
       service_order_items (
         id, label, value, item_type, options, sort_order, filled_by
       )`,
    )
    .eq("booking_id", booking.id)
    .order("sort_order")
    .order("sort_order", { referencedTable: "service_order_items" });

  const { data: playlist } = await supabase
    .from("playlists")
    .select("section, song_url, no_aplica")
    .eq("booking_id", booking.id);

  const eventTypeLabel: Record<string, string> = {
    boda: "Boda",
    quince: "Quinceañera",
    empresarial: "Empresarial",
    revelacion: "Revelación de Género",
  };

  const defaults = {
    full_name:           profile.full_name ?? "",
    cc:                  profile.cc ?? "",
    phone:               profile.phone ?? "",
    address:             profile.address ?? "",
    email:               profile.email,
    event_type:          booking.event_type ?? "boda",
    event_date:          booking.event_date ?? "",
    event_start_time:    booking.event_start_time ?? "",
    event_end_time:      booking.event_end_time ?? "",
    guest_count:         booking.guest_count ?? 1,
    valor_total:         booking.valor_total?.toString() ?? "",
    valor_anticipo:      booking.valor_anticipo?.toString() ?? "",
    fecha_segundo_abono: booking.fecha_segundo_abono ?? "",
    fecha_tercer_abono:  booking.fecha_tercer_abono ?? "",
    capilla:             booking.capilla === true ? "true" : booking.capilla === false ? "false" : "",
    contract_items:      (booking.contract_items as typeof DEFAULT_CONTRACT_ITEMS | null) ?? DEFAULT_CONTRACT_ITEMS,
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-gris hover:text-negro transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Volver a clientes
        </Link>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          <span className="text-dorado">{profile.full_name ?? profile.email}</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          {eventTypeLabel[booking.event_type ?? ""] ?? "Evento"} — datos del cliente y orden de servicio
        </p>
      </div>

      <ClienteEditForm
        clientId={clientId}
        bookingId={booking.id}
        defaults={defaults}
        redirectTo="/admin/clientes"
      />

      <div>
        <h3 className="font-serif text-[1.4rem] text-negro tracking-[-0.02em] mb-4">
          Orden de <span className="text-dorado">servicio</span>
        </h3>
        <PlannerOrdenForm
          booking={{
            id: booking.id,
            event_type: booking.event_type,
            event_date: booking.event_date,
            guest_count: booking.guest_count,
            status: booking.status,
            notes: booking.notes,
            client_name: profile.full_name ?? profile.email,
          }}
          sections={
            (sections ?? []) as Parameters<typeof PlannerOrdenForm>[0]["sections"]
          }
          playlist={
            (playlist ?? []) as Parameters<typeof PlannerOrdenForm>[0]["playlist"]
          }
        />
      </div>
    </div>
  );
}
