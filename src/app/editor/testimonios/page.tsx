import { createAdminClient } from "@/lib/supabase/admin";
import { TestimoniosManager } from "@/components/editor/TestimoniosManager";

export default async function TestimoniosPage() {
  const admin = createAdminClient();
  const { data: testimonios } = await admin
    .from("testimonials")
    .select("id, client_name, event_type, rating, content, is_published")
    .order("created_at", { ascending: false });

  return <TestimoniosManager testimonios={testimonios ?? []} />;
}
