"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  CreditCard,
  MessageSquare,
  User,
  BookOpen,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { PortalProfile } from "@/app/portal/layout";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  wedding_planner: "Wedding Planner",
  asesor_comercial: "Asesor Comercial",
  asesor_logistica: "Asesor Logística",
  staff: "Staff",
  client: "Cliente",
};

type NavItem = { href: string; label: string; icon: React.ElementType };

function getNavItems(role: string): NavItem[] {
  if (role === "client") {
    return [
      { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/portal/evento", label: "Mi Evento", icon: CalendarDays },
      { href: "/portal/documentos", label: "Documentos", icon: FileText },
      { href: "/portal/pagos", label: "Pagos", icon: CreditCard },
      { href: "/portal/mensajes", label: "Mensajes", icon: MessageSquare },
      { href: "/portal/perfil", label: "Mi Perfil", icon: User },
    ];
  }
  const base: NavItem[] = [
    { href: "/portal/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/portal/calendario", label: "Calendario", icon: CalendarDays },
    { href: "/portal/reservas", label: "Reservas", icon: BookOpen },
    { href: "/portal/ordenes", label: "Órdenes de Servicio", icon: ClipboardList },
    { href: "/portal/mensajes", label: "Mensajes", icon: MessageSquare },
    { href: "/portal/clientes", label: "Clientes", icon: Users },
  ];
  if (role === "admin") {
    base.push({ href: "/portal/configuracion", label: "Configuración", icon: Settings });
  }
  return base;
}

export function PortalSidebar({
  profile,
  isOpen,
  onClose,
}: {
  profile: PortalProfile;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const navItems = getNavItems(profile.role);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={[
        "fixed left-0 top-0 h-full w-[248px] z-30 flex flex-col",
        "bg-[#0F0F0F] transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      ].join(" ")}
    >
      {/* Botón cerrar — solo móvil */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:hidden text-blanco/40 hover:text-blanco transition-colors"
        aria-label="Cerrar menú"
      >
        <X size={20} />
      </button>

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-blanco/[0.06]">
        <Link href="/" className="block" onClick={onClose}>
          <span className="block text-[0.6rem] tracking-[0.4em] text-dorado uppercase font-light mb-0.5">
            Hacienda
          </span>
          <span className="block font-serif text-[1.6rem] text-blanco leading-none tracking-[-0.02em]">
            El Encanto
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                "flex items-center gap-3 px-5 py-[10px] mx-2 rounded-lg text-[0.82rem] font-medium transition-all duration-150",
                active
                  ? "bg-dorado/10 text-dorado"
                  : "text-blanco/50 hover:text-blanco hover:bg-blanco/[0.04]",
              ].join(" ")}
            >
              <item.icon
                size={16}
                className={active ? "text-dorado" : "text-blanco/40"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-blanco/[0.06] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-dorado/20 flex items-center justify-center shrink-0">
            <span className="text-dorado text-[0.7rem] font-semibold tracking-wide">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-blanco text-[0.78rem] font-medium truncate leading-tight">
              {profile.full_name ?? "Usuario"}
            </p>
            <p className="text-blanco/40 text-[0.68rem] truncate">
              {ROLE_LABEL[profile.role] ?? profile.role}
            </p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[0.78rem] text-blanco/40 hover:text-blanco/70 hover:bg-blanco/[0.04] transition-all duration-150"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
