"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado transition-colors duration-150";

const labelClass = "block text-xs text-gris uppercase tracking-wider mb-2";

export default function RegistroPage() {
  const [state, formAction] = useActionState(register, null);

  if (state?.success) {
    return (
      <div className="bg-blanco border border-crema-medio shadow-sm px-8 py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-verde/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-negro mb-2">¡Cuenta creada!</h2>
        <p className="text-sm text-gris mb-6">
          Revisa tu correo electrónico para confirmar tu cuenta y luego inicia sesión.
        </p>
        <Link
          href="/login"
          className="text-sm text-verde hover:text-verde-bosque transition-colors"
        >
          Ir al inicio de sesión →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-blanco border border-crema-medio shadow-sm px-8 py-10">
      <h2 className="font-serif text-2xl text-negro tracking-[-0.02em] mb-1">
        Planea tu evento
      </h2>
      <p className="text-sm text-gris mb-8">Crea tu cuenta y empieza a imaginar</p>

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder="Tu nombre"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
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
          <label htmlFor="phone" className={labelClass}>
            Teléfono <span className="normal-case text-gris-claro">(opcional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+57 300 000 0000"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Mínimo 8 caracteres"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Repite tu contraseña"
            className={inputClass}
          />
        </div>

        {state?.error && (
          <p className="text-rojo text-sm" role="alert">
            {state.error}
          </p>
        )}

        <SubmitButton
          label="Crear cuenta"
          pendingLabel="Creando cuenta…"
          className="w-full bg-rojo text-blanco py-3 font-serif tracking-wider text-sm hover:bg-rojo-pro mt-2"
        />
      </form>

      <p className="text-center text-sm text-gris mt-8">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-verde hover:text-verde-bosque transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
