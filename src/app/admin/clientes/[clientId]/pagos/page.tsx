import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PagosPlanner } from "@/components/portal/planner/PagosPlanner";

export default async function AdminPagosPage({
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
  if (!me || me.role !== "admin") redirect("/portal");

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles").select("id, full_name, email").eq("id", clientId).single();
  if (!profile) notFound();

  const { data: booking } = await admin
    .from("bookings")
    .select("id, total_amount")
    .eq("client_id", clientId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: pagos } = booking
    ? await admin
        .from("payments")
        .select("id, concept, amount, payment_date, payment_method, status, notes, receipt_url")
        .eq("booking_id", booking.id)
        .order("payment_date", { ascending: false })
    : { data: [] };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-[0.8rem] text-gris">
        <Link
          href={`/admin/clientes/${clientId}`}
          className="inline-flex items-center gap-1 hover:text-negro transition-colors"
        >
          <ArrowLeft size={13} />
          {profile.full_name ?? profile.email}
        </Link>
        <span>/</span>
        <span className="text-dorado">Pagos</span>
      </div>

      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          Pagos del cliente
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          {profile.full_name ?? profile.email}
        </p>
      </div>

      {!booking ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
          <p className="text-gris text-[0.88rem]">
            Este cliente no tiene un evento activo.
          </p>
        </div>
      ) : (
        <PagosPlanner bookingId={booking.id} totalAmount={booking.total_amount} initialPagos={pagos ?? []} />
      )}
    </div>
  );
}
