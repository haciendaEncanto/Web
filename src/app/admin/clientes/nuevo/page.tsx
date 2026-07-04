import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NuevoClienteForm } from "@/components/portal/NuevoClienteForm";

export default async function AdminNuevoClientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role !== "admin") redirect("/portal");

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-gris hover:text-negro transition-colors mb-3"
        >
          <ArrowLeft size={13} />
          Volver a clientes
        </Link>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Nuevo <span className="text-dorado">cliente</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Registra al cliente, crea su reserva y genera la orden de servicio en un solo paso.
        </p>
      </div>

      <NuevoClienteForm />
    </div>
  );
}
