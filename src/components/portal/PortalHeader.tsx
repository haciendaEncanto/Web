"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import type { PortalProfile } from "@/app/portal/layout";

const PAGE_TITLES: Record<string, string> = {
  "/portal/dashboard": "Dashboard",
  "/portal/evento": "Mi Evento",
  "/portal/orden-servicio": "Mi Orden de Servicio",
  "/portal/planner": "Órdenes de Servicio",
  "/portal/planner/orden-servicio": "Orden de Servicio",
  "/portal/planner/nuevo-cliente": "Nuevo Cliente",
  "/portal/asesor-comercial": "Panel Comercial",
  "/portal/asesor-logistica": "Panel Logística",
  "/portal/staff": "Panel Staff",
  "/portal/documentos": "Documentos",
  "/portal/pagos": "Pagos",
  "/portal/mensajes": "Mensajes",
  "/portal/perfil": "Mi Perfil",
  "/portal/calendario": "Calendario",
  "/portal/reservas": "Reservas",
  "/portal/ordenes": "Órdenes de Servicio",
  "/portal/clientes": "Clientes",
  "/portal/configuracion": "Configuración",
};

export function PortalHeader({
  profile,
  onMenuClick,
}: {
  profile: PortalProfile;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES)
      .filter(([k]) => pathname.startsWith(k + "/"))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "Portal";

  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-blanco border-b border-negro/[0.07] flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Hamburger — solo móvil */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-gris hover:text-negro transition-colors p-1 -ml-1"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Título de página */}
      <h1 className="flex-1 font-serif text-[1.25rem] text-negro tracking-[-0.02em]">
        {title}
      </h1>

      {/* Notificaciones */}
      <button className="relative text-gris hover:text-negro transition-colors p-1.5 rounded-lg hover:bg-negro/[0.04]">
        <Bell size={18} />
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-dorado/15 border border-dorado/30 flex items-center justify-center">
          <span className="text-dorado text-[0.65rem] font-semibold tracking-wide">
            {initials}
          </span>
        </div>
        <span className="hidden sm:block text-[0.82rem] text-negro/70 font-medium">
          {profile.full_name?.split(" ")[0] ?? "Usuario"}
        </span>
      </div>
    </header>
  );
}
