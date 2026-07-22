import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContratoAdminManager } from "@/components/admin/ContratoAdminManager";
import { AsesoresAsignacionesView } from "@/components/admin/AsesoresAsignacionesView";
import { CLAUSULA_KEYS, FIRMA_KEY, HACIENDA_CONTENT_KEYS } from "@/lib/contract-items";

export const metadata = { title: "Contrato y asesores — Hacienda El Encanto" };

export default async function ContratoAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/portal");

  const admin = createAdminClient();

  // Cláusulas, firma y datos editables de la hacienda
  const haciendaKeys = Object.values(HACIENDA_CONTENT_KEYS);
  const keysToFetch = [...CLAUSULA_KEYS, FIRMA_KEY, ...haciendaKeys];
  const { data: contentRows } = await admin
    .from("site_content")
    .select("key, content")
    .in("key", keysToFetch);

  const contentMap: Record<string, string | null> = {};
  for (const row of contentRows ?? []) {
    contentMap[row.key] = row.content ?? null;
  }

  const clauses: Record<string, string | null> = {};
  for (const key of CLAUSULA_KEYS) {
    clauses[key] = contentMap[key] ?? null;
  }
  const firmaUrl = contentMap[FIRMA_KEY] ?? null;

  const haciendaValues: Record<string, string | null> = {};
  for (const key of haciendaKeys) {
    haciendaValues[key] = contentMap[key] ?? null;
  }

  // Asesores comerciales y sus contadores
  const { data: asesores } = await admin
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "asesor_comercial")
    .eq("is_active", true)
    .order("full_name");

  const asesorIds = (asesores ?? []).map((a) => a.id);
  const { data: assignments } = asesorIds.length
    ? await admin
        .from("asesor_assignments")
        .select("asesor_id, total_assignments, last_assigned_at")
        .in("asesor_id", asesorIds)
    : { data: [] };

  const assignMap: Record<string, { total: number; last: string | null }> = {};
  for (const a of assignments ?? []) {
    assignMap[a.asesor_id] = { total: a.total_assignments, last: a.last_assigned_at };
  }

  const asesorRows = (asesores ?? []).map((a) => ({
    asesorId: a.id,
    nombre: a.full_name ?? a.email,
    email: a.email,
    phone: a.phone,
    total: assignMap[a.id]?.total ?? 0,
    lastAssignedAt: assignMap[a.id]?.last ?? null,
  }));

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Sección asesores */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
            Asesores <span className="text-dorado">comerciales</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            El botón de WhatsApp del sitio público asigna el contacto al asesor con menos
            conversaciones. Asegúrate de que cada asesor tenga su número registrado.
          </p>
        </div>
        <AsesoresAsignacionesView initial={asesorRows} />
      </div>

      {/* Divider */}
      <div className="border-t border-negro/[0.07]" />

      {/* Plantilla de contrato */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
            Plantilla de <span className="text-dorado">contrato</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            Edita las cláusulas y sube la firma del representante legal. Los cambios
            se reflejan en todos los contratos que se generen a partir de ahora.
          </p>
        </div>
        <ContratoAdminManager clauses={clauses} firmaUrl={firmaUrl} haciendaValues={haciendaValues} />
      </div>
    </div>
  );
}
