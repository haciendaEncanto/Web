"use client";

import { useFormStatus } from "react-dom";

interface Props {
  label: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({ label, pendingLabel = "Enviando…", className = "", disabled = false }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`relative transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
