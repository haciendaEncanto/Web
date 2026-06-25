"use client";

import { useCallback, useState } from "react";
import { PortalSidebar } from "./PortalSidebar";
import { PortalHeader } from "./PortalHeader";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";
import { InactivityWarning } from "./InactivityWarning";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { logout } from "@/app/actions/auth";
import type { PortalProfile } from "@/app/portal/layout";

// 4 minutos de inactividad → mostrar advertencia
// 60 segundos de countdown → logout automático
const INACTIVITY_MS = 4 * 60 * 1000;
const WARNING_MS = 60 * 1000;

export function PortalShell({
  profile,
  children,
}: {
  profile: PortalProfile;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const triggerLogout = useCallback(async () => {
    setShowWarning(false);
    setLoggingOut(true);
    await new Promise<void>((r) => setTimeout(r, 1000));
    await logout();
  }, []);

  useInactivityTimer({
    inactivityMs: INACTIVITY_MS,
    warningMs: WARNING_MS,
    isPaused: showWarning,
    onWarn: () => setShowWarning(true),
    onTimeout: triggerLogout,
  });

  return (
    <div className="min-h-screen flex bg-crema">
      {/* Overlay móvil del sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-negro/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <PortalSidebar
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 md:ml-[248px]">
        <PortalHeader
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modal de inactividad */}
      {showWarning && (
        <InactivityWarning
          warningSeconds={WARNING_MS / 1000}
          onContinue={() => setShowWarning(false)}
          onLogout={triggerLogout}
        />
      )}

      {/* Overlay de transición al cerrar sesión por inactividad */}
      <TransitionOverlay visible={loggingOut} />
    </div>
  );
}
