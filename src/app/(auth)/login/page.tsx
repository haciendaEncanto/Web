"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado rounded-lg transition-colors duration-150";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10">
      <h2 className="font-serif text-2xl text-negro tracking-[-0.02em] mb-1">
        Bienvenido
      </h2>
      <p className="text-sm text-gris mb-8">Accede a tu portal de eventos</p>

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

        <div>
          <label htmlFor="password" className="block text-xs text-gris uppercase tracking-wider mb-2">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {state?.error && (
          <p className="text-rojo text-sm" role="alert">
            {state.error}
          </p>
        )}

        <SubmitButton
          label="Ingresar"
          pendingLabel="Ingresando…"
          className="w-full bg-rojo text-blanco py-3 font-serif tracking-wider text-sm hover:bg-rojo-pro mt-2"
        />
      </form>

      <div className="flex flex-col items-center gap-3 mt-6">
        <Link
          href="/reset-password"
          className="text-xs text-dorado hover:underline cursor-pointer transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-dorado hover:text-dorado/70 transition-colors"
        >
          <span aria-hidden>←</span> Regresar al inicio
        </Link>
      </div>
    </div>
  );
}
