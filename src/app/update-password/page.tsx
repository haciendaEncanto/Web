"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado rounded-lg transition-colors duration-150 pr-10";

function BrandedShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-crema flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] animate-[page-fade-in_0.45s_ease_both]">
        <div className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-principal-fondo-claro.svg"
            alt="Hacienda El Encanto"
            style={{ width: "100%", height: "auto" }}
          />
          <div className="mt-6 h-px bg-dorado/60" />
        </div>
        {children}
      </div>
    </main>
  );
}

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setExchangeError("El enlace expiró o ya fue utilizado. Solicita uno nuevo.");
        } else {
          window.history.replaceState({}, "", "/update-password");
          setReady(true);
        }
      });
    } else {
      setReady(true);
    }
  }, []);

  if (exchangeError) {
    return (
      <BrandedShell>
        <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10 text-center space-y-4">
          <p className="text-sm text-rojo">{exchangeError}</p>
          <Link
            href="/reset-password"
            className="inline-flex items-center gap-1.5 text-xs text-dorado hover:underline transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </BrandedShell>
    );
  }

  if (!ready) {
    return (
      <BrandedShell>
        <div className="bg-blanco border border-crema-medio shadow-sm rounded-2xl px-8 py-10 text-center">
          <p className="text-sm text-gris">Verificando enlace…</p>
        </div>
      </BrandedShell>
    );
  }

  return (
    <BrandedShell>
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
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors"
              >
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
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-rojo text-sm" role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton
            label="Actualizar contraseña"
            pendingLabel="Actualizando…"
            className="w-full bg-rojo text-blanco py-3 font-serif tracking-wider text-sm hover:bg-rojo-pro mt-2"
          />
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-dorado hover:text-dorado/70 transition-colors"
          >
            <span aria-hidden>←</span> Regresar al inicio de sesión
          </Link>
        </div>
      </div>
    </BrandedShell>
  );
}
