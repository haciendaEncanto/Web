"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { resetAsignaciones } from "@/app/actions/admin/asesores";

interface AsesorRow {
  asesorId: string;
  nombre: string;
  email: string;
  phone: string | null;
  total: number;
  lastAssignedAt: string | null;
}

export function AsesoresAsignacionesView({ initial }: { initial: AsesorRow[] }) {
  const [rows, setRows] = useState(initial);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReset(asesorId: string) {
    setResettingId(asesorId);
    startTransition(async () => {
      const res = await resetAsignaciones(asesorId);
      if (!res.error) {
        setRows((prev) => prev.map((r) => r.asesorId === asesorId ? { ...r, total: 0, lastAssignedAt: null } : r));
      }
      setResettingId(null);
    });
  }

  if (rows.length === 0) {
    return (
      <p className="text-[0.84rem] text-gris">
        No hay asesores comerciales activos registrados. Crea usuarios con rol{" "}
        <span className="text-negro font-medium">Asesor Comercial</span> en la sección Usuarios
        y asegúrate de que tengan un número de teléfono de WhatsApp registrado.
      </p>
    );
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-negro/[0.06] bg-crema/40">
              <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Asesor</th>
              <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">WhatsApp</th>
              <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-center">Asignaciones</th>
              <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Última asign.</th>
              <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-negro/[0.04]">
            {rows.map((r) => (
              <tr key={r.asesorId} className="hover:bg-crema/20 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-[0.84rem] text-negro font-medium">{r.nombre}</p>
                  <p className="text-[0.73rem] text-gris">{r.email}</p>
                </td>
                <td className="px-4 py-3.5 text-[0.82rem] text-gris">
                  {r.phone ?? <span className="text-amber-600">Sin teléfono</span>}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-dorado/10 text-dorado text-[0.85rem] font-semibold">
                    {r.total}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[0.78rem] text-gris whitespace-nowrap">
                  {r.lastAssignedAt
                    ? new Date(r.lastAssignedAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => handleReset(r.asesorId)}
                    disabled={isPending || r.total === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-negro/15 text-[0.75rem] text-gris rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resettingId === r.asesorId && isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RotateCcw size={12} />
                    )}
                    Reiniciar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
