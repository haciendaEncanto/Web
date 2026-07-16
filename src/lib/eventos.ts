import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getUpcomingEventWindow } from "@/lib/event-window";

export type BookingEventRow = {
  id: string;
  event_type: string | null;
  event_date: string | null;
  event_start_time: string | null;
  event_end_time: string | null;
  guest_count: number | null;
  status: string | null;
  profiles: { full_name: string | null; email: string } | null;
};

export async function fetchAllBookingsWithClient(
  client: SupabaseClient<Database>,
  options?: { restrictToUpcoming?: boolean },
): Promise<BookingEventRow[]> {
  try {
    await client.rpc("sync_completed_bookings");
  } catch {
    // best-effort — el cron ya cubre esto de forma independiente
  }

  let query = client
    .from("bookings")
    .select(
      `id, event_type, event_date, event_start_time, event_end_time,
       guest_count, status, profiles (full_name, email)`,
    );

  if (options?.restrictToUpcoming) {
    const { from, to } = getUpcomingEventWindow();
    query = query.gte("event_date", from).lte("event_date", to);
  }

  const { data } = await query.order("event_date", {
    ascending: !!options?.restrictToUpcoming,
  });

  return (data ?? []) as unknown as BookingEventRow[];
}
