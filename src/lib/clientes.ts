import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ClientSegment = "activos" | "cumplidos" | "cancelados";

export function getClientSegment(status: string | null, isActive: boolean): ClientSegment {
  if (status === "cancelled" || !isActive) return "cancelados";
  if (status === "completed") return "cumplidos";
  return "activos";
}

export type ClientBookingRow = {
  id: string;
  client_id: string;
  event_type: string | null;
  event_date: string | null;
  event_start_time: string | null;
  event_end_time: string | null;
  guest_count: number | null;
  status: string | null;
  service_order_approved: boolean | null;
  profiles: { id: string; full_name: string | null; email: string; is_active: boolean } | null;
  service_order_sections: { id: string }[];
};

export async function fetchClientBookingRows(
  client: SupabaseClient<Database>,
): Promise<ClientBookingRow[]> {
  try {
    await client.rpc("sync_completed_bookings");
  } catch {
    // best-effort — el cron ya cubre esto de forma independiente
  }

  const { data } = await client
    .from("bookings")
    .select(
      `id, client_id, event_type, event_date, event_start_time, event_end_time,
       guest_count, status, service_order_approved,
       profiles!inner (id, full_name, email, is_active, role),
       service_order_sections (id)`,
    )
    .eq("profiles.role", "client")
    .order("event_date", { ascending: true });

  return (data ?? []) as unknown as ClientBookingRow[];
}
