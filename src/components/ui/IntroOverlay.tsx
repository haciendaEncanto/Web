"use client";

import { useEffect, useState } from "react";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";

const INTRO_MS = 600;

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  return <TransitionOverlay visible={visible} />;
}
