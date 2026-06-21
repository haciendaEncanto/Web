"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado transition-colors duration-150";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="bg-blanco border border-crema-medio shadow-sm px-8 py-10">
      <h2 className="font-serif text-2xl text-negro tracking-[-0.02em] mb-1">
        Bienvenido de nuevo
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
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-xs text-gris uppercase tracking-wider">
              Contraseña
            </label>
            {/* Recuperar contraseña — Fase 3 */}
            <span className="text-xs text-gris-claro">¿Olvidaste tu contraseña?</span>
          </div>
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

      <p className="text-center text-sm text-gris mt-8">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-verde hover:text-verde-bosque transition-colors">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
