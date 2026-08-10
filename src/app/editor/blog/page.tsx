import { createRawAdminClient } from "@/lib/supabase/admin";
import { BlogManager } from "@/components/editor/BlogManager";
import type { BlogPostRow } from "@/app/actions/editor/blog";

export default async function BlogEditorPage() {
  const db = createRawAdminClient();
  const { data } = await db
    .from("blog_posts")
    .select("id,titulo,slug,resumen,contenido,foto_url,autor,is_published,published_at,created_at")
    .order("created_at", { ascending: false });

  return <BlogManager posts={(data ?? []) as BlogPostRow[]} />;
}
