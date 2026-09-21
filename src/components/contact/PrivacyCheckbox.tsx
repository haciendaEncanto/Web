"use client";

import Link from "next/link";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// Aceptación obligatoria de la política de datos (Ley 1581 de 2012).
// value="true" → el servidor recibe aceptaPolitica="true" solo si está marcado.
export function PrivacyCheckbox({ checked, onChange }: Props) {
  return (
    <label className="flex items-start gap-3 cursor-pointer text-[0.78rem] text-gris leading-relaxed">
      <input
        type="checkbox"
        name="aceptaPolitica"
        value="true"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-rojo"
      />
      <span>
        Acepto la{" "}
        <Link
          href="/politica-de-privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-rojo hover:text-rojo-pro"
        >
          Política de Tratamiento de Datos Personales
        </Link>
      </span>
    </label>
  );
}
