"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";

// Salvavidas: si por algún motivo el pathname nunca cambia (navegación a la
// misma ruta, error, etc.) el overlay no debe quedar visible para siempre.
const SAFETY_MS = 5000;

const PageTransitionContext = createContext<(() => void) | null>(null);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const activeRef = useRef(false);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    activeRef.current = true;
    setVisible(true);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    safetyRef.current = setTimeout(() => {
      activeRef.current = false;
      setVisible(false);
    }, SAFETY_MS);
  }, []);

  useEffect(() => {
    // El pathname cambió: la nueva página ya está montada — nunca bloquea
    // la navegación en sí (router.push ya se disparó al hacer clic), solo
    // oculta el overlay decorativo.
    if (!activeRef.current) return;
    activeRef.current = false;
    if (safetyRef.current) clearTimeout(safetyRef.current);
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  return (
    <PageTransitionContext.Provider value={start}>
      {children}
      <TransitionOverlay visible={visible} />
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const start = useContext(PageTransitionContext);
  if (!start) {
    throw new Error("usePageTransition debe usarse dentro de <PageTransitionProvider>");
  }
  return start;
}
