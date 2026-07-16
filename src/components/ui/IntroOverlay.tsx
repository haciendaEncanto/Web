"use client";

import { useEffect, useState } from "react";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";

const INTRO_MS = 600;

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // El logout ya mostró su propio overlay de transición — no repetirlo
    // en el Home al llegar desde ahí.
    if (sessionStorage.getItem("fromLogout")) {
      sessionStorage.removeItem("fromLogout");
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  return <TransitionOverlay visible={visible} />;
}
