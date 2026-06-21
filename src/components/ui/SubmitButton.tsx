"use client";

import { useFormStatus } from "react-dom";

interface Props {
  label: string;
  pendingLabel?: string;
  className?: string;
}

export function SubmitButton({ label, pendingLabel = "Enviando…", className = "" }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
