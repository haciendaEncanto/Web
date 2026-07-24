"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado rounded-lg transition-colors duration-150";

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordReset, null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setExpired(new URLSearchParams(window.location.search).get("expired") === "1");
  }, []);

  if (state?.success) {
    return (
      <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-dorado/10 flex items-center justify-center mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dorado">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-negro tracking-[-0.02em]">Revisa tu correo</h2>
        <p className="text-sm text-gris leading-relaxed">
          Si esa dirección está registrada, recibirás un enlace para restablecer tu contraseña.
          El enlace es válido por 1 hora.
        </p>
        <Link href="/login"
          className="inline-block mt-2 text-xs text-dorado hover:text-dorado/70 transition-colors">
          ← Regresar al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10">
      <h2 className="font-serif text-2xl text-negro tracking-[-0.02em] mb-1">
        Recuperar contraseña
      </h2>
      <p className="text-sm text-gris mb-8">
        Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
      </p>

      {expired && (
        <div className="mb-5 rounded-lg bg-rojo/8 border border-rojo/20 px-4 py-3">
          <p className="text-sm text-rojo">
            El enlace expiró o ya fue utilizado. Solicita uno nuevo.
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs text-gris uppercase tracking-wider mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </div>

        {state?.error && (
          <p className="text-rojo text-sm" role="alert">{state.error}</p>
        )}

        <SubmitButton
          label="Enviar enlace de recuperación"
          pendingLabel="Enviando…"
          className="w-full bg-rojo text-blanco py-3 font-serif tracking-wider text-sm hover:bg-rojo-pro mt-2"
        />
      </form>

      <div className="text-center mt-6">
        <Link href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-dorado hover:text-dorado/70 transition-colors">
          <span aria-hidden>←</span> Regresar al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
