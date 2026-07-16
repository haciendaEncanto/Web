import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StaffEventsView, type EventoActivo } from "@/components/portal/StaffEventsView";
import type { PlaylistSection } from "@/lib/playlist-templates";
import { getUpcomingEventWindow } from "@/lib/event-window";

export default async function StaffPanel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/portal");
  }

  let bookingsQuery = supabase
    .from("bookings")
    .select("id, event_type, event_date, profiles(full_name, email)")
    .in("status", ["pending", "confirmed"]);

  if (profile.role !== "admin") {
    const { from, to } = getUpcomingEventWindow();
    bookingsQuery = bookingsQuery.gte("event_date", from).lte("event_date", to);
  }

  const { data: bookings } = await bookingsQuery.order("event_date", { ascending: true });

  const bookingIds = (bookings ?? []).map((b) => b.id);
  const { data: playlistRows } = bookingIds.length
    ? await supabase
        .from("playlists")
        .select("booking_id, section, song_url, no_aplica")
        .in("booking_id", bookingIds)
    : { data: [] };

  const eventos: EventoActivo[] = (bookings ?? []).map((b) => {
    const client = b.profiles as { full_name: string | null; email: string } | null;
    return {
      bookingId: b.id,
      clientName: client?.full_name ?? client?.email ?? "Cliente",
      eventType: b.event_type,
      eventDate: b.event_date,
      playlist: (playlistRows ?? [])
        .filter((p) => p.booking_id === b.id)
        .map((p) => ({
          section: p.section as PlaylistSection,
          song_url: p.song_url,
          no_aplica: p.no_aplica,
        })),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Panel <span className="text-dorado">Staff</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Eventos activos y su playlist musical
        </p>
      </div>
      <StaffEventsView eventos={eventos} />
    </div>
  );
}
