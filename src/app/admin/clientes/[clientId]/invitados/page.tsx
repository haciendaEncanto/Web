import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listGuestListsConTamano } from "@/app/actions/invitados";
import { InvitadosReadOnly } from "@/components/portal/InvitadosReadOnly";

export default async function InvitadosAdminPage({
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
    .select("id, guest_count")
    .eq("client_id", clientId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let mapUrl: string | null = null;
  let mapName: string | null = null;
  let files: Awaited<ReturnType<typeof listGuestListsConTamano>> = [];

  if (booking) {
    const guestCount = booking.guest_count ?? 0;
    const { data: maps } = await admin
      .from("salon_maps")
      .select("name, image_url")
      .lte("min_guests", guestCount)
      .gte("max_guests", guestCount)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    mapUrl = maps?.[0]?.image_url ?? null;
    mapName = maps?.[0]?.name ?? null;

    const { data: rows } = await admin
      .from("guest_tables")
      .select("id, file_url, uploaded_at")
      .eq("booking_id", booking.id)
      .order("uploaded_at", { ascending: false });
    files = await listGuestListsConTamano(rows ?? []);
  }

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
        <span className="text-dorado">Invitados</span>
      </div>

      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          Distribución de mesas
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
        <InvitadosReadOnly mapUrl={mapUrl} mapName={mapName} files={files} />
      )}
    </div>
  );
}
