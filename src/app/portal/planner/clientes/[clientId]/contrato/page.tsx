import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listDocumentosConTamano } from "@/app/actions/documentos";
import { ContratoPlanner } from "@/components/portal/planner/ContratoPlanner";
import { ContractItemsForm } from "@/components/portal/planner/ContractItemsForm";
import { coerceContractItems } from "@/lib/contract-items";

export default async function ContratoPlannerPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || !["admin", "wedding_planner"].includes(me.role)) redirect("/portal");

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, cc, address, phone")
    .eq("id", clientId)
    .single();
  if (!profile) notFound();

  const { data: booking } = await admin
    .from("bookings")
    .select("id, valor_total, valor_anticipo, contract_locked, contract_items, capilla, guest_count")
    .eq("client_id", clientId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: rows } = booking
    ? await admin
        .from("documents")
        .select("id, title, type, created_at, file_url")
        .eq("booking_id", booking.id)
        .eq("type", "contrato")
        .order("created_at", { ascending: false })
    : { data: [] };

  const contratos = await listDocumentosConTamano(rows ?? []);

  const prereqs = [
    {
      ok: !!profile.cc,
      label: "CC / Cédula del cliente registrada",
      hint: "Edita el perfil del cliente y agrega su cédula.",
    },
    {
      ok: !!profile.address,
      label: "Dirección del cliente registrada",
      hint: "Edita el perfil del cliente y agrega su dirección.",
    },
    {
      ok: !!profile.phone,
      label: "Teléfono del cliente registrado",
      hint: "Edita el perfil del cliente y agrega su número de teléfono.",
    },
    {
      ok: !!profile.email,
      label: "Correo electrónico del cliente registrado",
      hint: "El cliente necesita un correo electrónico asociado.",
    },
    {
      ok: !!booking,
      label: "Evento activo asignado",
      hint: "El cliente necesita un evento activo (no cancelado).",
    },
    {
      ok: !!booking?.valor_total,
      label: "Valor total del evento registrado",
      hint: "Edita los datos del cliente y define el valor total.",
    },
    {
      ok: !!booking?.valor_anticipo,
      label: "Valor del anticipo registrado",
      hint: "Edita los datos del cliente y define el valor del anticipo.",
    },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          Contrato de <span className="text-dorado">servicios</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          {profile.full_name ?? profile.email}
        </p>
      </div>

      {booking && (
        <ContractItemsForm
          bookingId={booking.id}
          initialItems={coerceContractItems(booking.contract_items)}
          initialCapilla={booking.capilla ?? false}
          isLocked={booking.contract_locked ?? false}
          guestCount={booking.guest_count ?? undefined}
        />
      )}

      <ContratoPlanner
        clientId={clientId}
        bookingId={booking?.id ?? null}
        clientName={profile.full_name ?? profile.email}
        prereqs={prereqs}
        isLocked={booking?.contract_locked ?? false}
        initialContratos={contratos}
      />
    </div>
  );
}
