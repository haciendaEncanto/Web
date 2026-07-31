"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil, FileText, ScrollText, CreditCard, Music2, Users, CalendarDays } from "lucide-react";

const TABS = [
  { segment: "editar",      label: "Editar",       Icon: Pencil },
  { segment: "documentos",  label: "Documentos",   Icon: FileText },
  { segment: "contrato",    label: "Contrato",     Icon: ScrollText },
  { segment: "pagos",       label: "Pagos",        Icon: CreditCard },
  { segment: "playlist",    label: "Playlist",     Icon: Music2 },
  { segment: "invitados",   label: "Invitados",    Icon: Users },
  { segment: "actividades", label: "Actividades",  Icon: CalendarDays },
];

const ASESOR_SEGMENTS = new Set(["editar", "documentos", "contrato", "pagos"]);

export function ClienteTabNav({
  clientId,
  role,
  basePath = "/portal/planner/clientes",
}: {
  clientId: string;
  role: string;
  basePath?: string;
}) {
  const pathname = usePathname();
  const tabs = role === "asesor_comercial"
    ? TABS.filter((t) => ASESOR_SEGMENTS.has(t.segment))
    : TABS;

  return (
    <div className="flex gap-1 flex-wrap">
      {tabs.map(({ segment, label, Icon }) => {
        const href = `${basePath}/${clientId}/${segment}`;
        const isActive = pathname === href;
        return (
          <Link
            key={segment}
            href={href}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors",
              isActive
                ? "bg-dorado text-blanco"
                : "text-negro/50 hover:text-negro hover:bg-negro/5",
            ].join(" ")}
          >
            <Icon size={13} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
