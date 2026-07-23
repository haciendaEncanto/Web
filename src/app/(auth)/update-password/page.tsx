"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado rounded-lg transition-colors duration-150 pr-10";

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (state?.success) {
    return (
      <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-dorado/10 flex items-center justify-center mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dorado">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-negro tracking-[-0.02em]">¡Contraseña actualizada!</h2>
        <p className="text-sm text-gris">
          Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link href="/login"
          className="inline-block mt-2 px-6 py-2.5 bg-rojo text-blanco text-sm font-serif tracking-wider rounded-lg hover:bg-rojo-pro transition-colors">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10">
      <h2 className="font-serif text-2xl text-negro tracking-[-0.02em] mb-1">
        Nueva contraseña
      </h2>
      <p className="text-sm text-gris mb-8">
        Elige una contraseña segura para proteger tu cuenta.
      </p>

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-xs text-gris uppercase tracking-wider mb-2">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className={inputClass}
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs text-gris uppercase tracking-wider mb-2">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Repite la contraseña"
              className={inputClass}
            />
            <button type="button" onClick={() => setShowConfirm(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {state?.error && (
          <p className="text-rojo text-sm" role="alert">{state.error}</p>
        )}

        <SubmitButton
          label="Guardar nueva contraseña"
          pendingLabel="Guardando…"
          className="w-full bg-rojo text-blanco py-3 font-serif tracking-wider text-sm hover:bg-rojo-pro mt-2"
        />
      </form>
    </div>
  );
}
