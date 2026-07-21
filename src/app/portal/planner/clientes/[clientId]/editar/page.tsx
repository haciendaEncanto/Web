import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClienteEditForm } from "@/components/portal/planner/ClienteEditForm";

interface Props {
  params: Promise<{ clientId: string }>;
}

export default async function EditarClientePage({ params }: Props) {
  const { clientId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!caller || !["admin", "wedding_planner"].includes(caller.role)) {
    redirect("/portal");
  }

  // Perfil del cliente
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, address, cc")
    .eq("id", clientId)
    .single();

  if (!profile) notFound();

  // Booking activo del cliente (el más reciente si hay varios)
  const { data: booking } = await supabase
    .from("bookings")
    .select(`id, event_type, event_date, event_start_time, event_end_time, guest_count,
             valor_total, valor_anticipo, fecha_segundo_abono, fecha_tercer_abono, capilla, contract_items`)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!booking) notFound();

  const { DEFAULT_CONTRACT_ITEMS } = await import("@/lib/contract-items");

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
    <div className="space-y-6 max-w-2xl">
      {/* Cabecera */}
      <div>
        <Link
          href="/portal/planner/clientes"
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-gris hover:text-negro transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Volver a clientes
        </Link>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Editar{" "}
          <span className="text-dorado">{profile.full_name ?? profile.email}</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Datos del cliente y del evento. Los cambios se aplican de inmediato.
        </p>
      </div>

      <ClienteEditForm
        clientId={clientId}
        bookingId={booking.id}
        defaults={defaults}
      />
    </div>
  );
}
