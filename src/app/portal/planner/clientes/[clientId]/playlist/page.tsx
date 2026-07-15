import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlaylistReadOnly } from "@/components/portal/PlaylistReadOnly";

export default async function PlaylistPlannerPage({
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

  const { data: profile } = await supabase
    .from("profiles").select("id, full_name, email").eq("id", clientId).single();
  if (!profile) notFound();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, event_type")
    .eq("client_id", clientId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: items } = booking
    ? await supabase
        .from("playlists")
        .select("section, song_url, no_aplica")
        .eq("booking_id", booking.id)
    : { data: [] };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-[0.8rem] text-gris">
        <Link
          href="/portal/planner/clientes"
          className="inline-flex items-center gap-1 hover:text-negro transition-colors"
        >
          <ArrowLeft size={13} />
          Clientes
        </Link>
        <span>/</span>
        <span className="text-negro">{profile.full_name ?? profile.email}</span>
        <span>/</span>
        <span className="text-dorado">Playlist</span>
      </div>

      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          Playlist del cliente
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
        <PlaylistReadOnly eventType={booking.event_type} items={items ?? []} />
      )}
    </div>
  );
}
