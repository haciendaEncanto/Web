import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portal/PortalShell";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Portal | Hacienda El Encanto",
};

export type PortalProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: Database["public"]["Enums"]["user_role"];
  avatar_url: string | null;
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <PortalShell profile={profile as PortalProfile}>{children}</PortalShell>
  );
}
