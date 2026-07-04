"use client";

import { useState, useTransition, useActionState } from "react";
import { UserPlus, Pencil, ToggleLeft, ToggleRight, Loader2, X, Eye, EyeOff } from "lucide-react";
import {
  crearUsuario, editarUsuario, toggleUsuarioActivo,
  type CrearUsuarioState, type EditarUsuarioState,
} from "@/app/actions/admin/usuarios";

type Usuario = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador", wedding_planner: "Wedding Planner",
  asesor_comercial: "Asesor Comercial", asesor_logistica: "Asesor Logística",
  staff: "Staff", editor: "Editor", gerente: "Gerente",
};
const ROLE_OPTIONS = [
  "admin", "wedding_planner", "asesor_comercial", "asesor_logistica",
  "staff", "editor", "gerente",
];
const ROLE_COLOR: Record<string, string> = {
  admin: "bg-rojo/10 text-rojo border-rojo/20",
  editor: "bg-dorado/10 text-dorado border-dorado/20",
  wedding_planner: "bg-purple-50 text-purple-700 border-purple-200",
  gerente: "bg-blue-50 text-blue-700 border-blue-200",
};

function Badge({ role }: { role: string }) {
  return (
    <span className={`text-[0.66rem] font-medium px-2 py-0.5 rounded-full border ${ROLE_COLOR[role] ?? "bg-negro/5 text-gris border-negro/10"}`}>
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors placeholder:text-gris/35";

// ─── Modal Crear Usuario ──────────────────────────────────────
function CrearModal({ onClose }: { onClose: () => void }) {
  const [state, action] = useActionState<CrearUsuarioState, FormData>(crearUsuario, null);
  const [showPwd, setShowPwd] = useState(false);

  if (state?.success) { onClose(); return null; }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-negro/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[1.1rem] text-negro">Nuevo usuario</h3>
          <button onClick={onClose} className="text-gris hover:text-negro p-1"><X size={18} /></button>
        </div>

        {state?.error && !state.field && (
          <p className="text-[0.78rem] text-rojo bg-rojo/5 rounded-lg px-3 py-2">{state.error}</p>
        )}

        <form action={action} className="space-y-3">
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Nombre completo *</label>
            <input name="full_name" type="text" required className={inputCls} />
            {state?.field === "full_name" && <p className="text-[0.72rem] text-rojo mt-1">{state.error}</p>}
          </div>
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Email *</label>
            <input name="email" type="email" required className={inputCls} />
            {state?.field === "email" && <p className="text-[0.72rem] text-rojo mt-1">{state.error}</p>}
          </div>
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Contraseña temporal *</label>
            <div className="relative">
              <input name="password" type={showPwd ? "text" : "password"} required className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {state?.field === "password" && <p className="text-[0.72rem] text-rojo mt-1">{state.error}</p>}
          </div>
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Rol *</label>
            <select name="role" defaultValue="" required className={inputCls}>
              <option value="" disabled>Seleccionar rol…</option>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90">
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Editar Usuario ─────────────────────────────────────
function EditarModal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const [state, action] = useActionState<EditarUsuarioState, FormData>(editarUsuario, null);
  const [isActive, setIsActive] = useState(usuario.is_active);

  if (state?.success) { onClose(); return null; }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-negro/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[1.1rem] text-negro">Editar usuario</h3>
          <button onClick={onClose} className="text-gris hover:text-negro p-1"><X size={18} /></button>
        </div>

        {state?.error && !state.field && (
          <p className="text-[0.78rem] text-rojo bg-rojo/5 rounded-lg px-3 py-2">{state.error}</p>
        )}

        <form action={action} className="space-y-3">
          <input type="hidden" name="id" value={usuario.id} />
          <input type="hidden" name="is_active" value={String(isActive)} />
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Nombre completo *</label>
            <input name="full_name" type="text" defaultValue={usuario.full_name ?? ""} required className={inputCls} />
          </div>
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Email *</label>
            <input name="email" type="email" defaultValue={usuario.email} required className={inputCls} />
          </div>
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Rol *</label>
            <select name="role" defaultValue={usuario.role} required className={inputCls}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[0.8rem] text-negro">Estado de cuenta</span>
            <button type="button" onClick={() => setIsActive(p => !p)}
              className={`flex items-center gap-2 text-[0.8rem] font-medium transition-colors ${isActive ? "text-green-700" : "text-gris"}`}>
              {isActive ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} />}
              {isActive ? "Activo" : "Inactivo"}
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────
export function UsuariosManager({ usuarios }: { usuarios: Usuario[] }) {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [toggling, startToggle] = useTransition();

  function handleToggle(u: Usuario) {
    startToggle(async () => {
      await toggleUsuarioActivo(u.id, !u.is_active);
    });
  }

  return (
    <>
      {showCrear && <CrearModal onClose={() => setShowCrear(false)} />}
      {editando && <EditarModal usuario={editando} onClose={() => setEditando(null)} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Equipo</span> / usuarios del sistema
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">{usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowCrear(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
          <UserPlus size={15} />
          Nuevo usuario
        </button>
      </div>

      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-negro/[0.06] bg-crema/40">
                <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Nombre</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Rol</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Registro</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-negro/[0.04]">
              {usuarios.map((u) => (
                <tr key={u.id} className={`hover:bg-crema/20 transition-colors ${!u.is_active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-[0.85rem] font-medium text-negro">{u.full_name ?? "—"}</p>
                    <p className="text-[0.73rem] text-gris mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5"><Badge role={u.role} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded-full border ${u.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-negro/5 text-gris border-negro/10"}`}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[0.78rem] text-gris whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditando(u)}
                        className="p-2 text-negro/30 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleToggle(u)} disabled={toggling}
                        className="p-2 text-negro/30 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors disabled:opacity-50"
                        title={u.is_active ? "Desactivar" : "Activar"}>
                        {u.is_active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
