"use client";

import { useState, useActionState } from "react";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import { cambiarPassword, type CambiarPasswordState } from "@/app/actions/admin/usuarios";

const inputCls =
  "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors placeholder:text-gris/35";

interface Props {
  userId: string;
  displayName: string;
}

export function CambiarPasswordButton({ userId, displayName }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<CambiarPasswordState, FormData>(cambiarPassword, null);
  const [showPwd, setShowPwd] = useState(false);

  if (state?.success && open) setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 border border-negro/15 rounded-lg text-[0.78rem] text-negro hover:bg-dorado/5 hover:border-dorado/30 hover:text-dorado transition-colors"
        title="Cambiar contraseña"
      >
        <KeyRound size={13} />
        Cambiar contraseña
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-negro/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-blanco rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[1.1rem] text-negro">Cambiar contraseña</h3>
                <p className="text-[0.75rem] text-gris mt-0.5">{displayName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gris hover:text-negro p-1">
                <X size={18} />
              </button>
            </div>

            {state?.error && (
              <p className="text-[0.78rem] text-rojo bg-rojo/5 rounded-lg px-3 py-2">{state.error}</p>
            )}

            <form action={action} className="space-y-3">
              <input type="hidden" name="userId" value={userId} />
              <div>
                <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
                  Nueva contraseña <span className="normal-case text-gris/50">(mín. 8 caracteres)</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rojo text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-rojo-pro transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
