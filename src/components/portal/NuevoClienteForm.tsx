"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  createClientAction,
  type CreateClientState,
} from "@/app/actions/crear-cliente";

// ─── Helpers de estilo ────────────────────────────────────────────────

const fieldBase =
  "w-full border px-3 py-2.5 text-[0.83rem] text-negro bg-blanco placeholder:text-gris/40 focus:outline-none transition-colors rounded-lg";

function inputCls(hasError: boolean) {
  return `${fieldBase} ${hasError ? "border-red-400 focus:border-red-400" : "border-negro/10 focus:border-dorado/70"}`;
}

// ─── Campo de formulario individual ──────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[0.72rem] text-gris uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-dorado ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[0.7rem] text-gris/60 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[0.72rem] text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────

export function NuevoClienteForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState<CreateClientState, FormData>(
    createClientAction,
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir al orden de servicio cuando se crea el cliente exitosamente
  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push(`/portal/planner/orden-servicio/${state.bookingId}`);
    }
  }, [state, router]);

  const fieldError = (name: string) =>
    state && "error" in state && state.field === name
      ? state.error
      : undefined;

  const globalError =
    state && "error" in state && !state.field ? state.error : null;

  return (
    <form action={action} className="space-y-5">
      {/* Error global */}
      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[0.82rem] text-red-600">
          {globalError}
        </div>
      )}

      {/* ── Sección 1: Datos del cliente ─────────────────────────── */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
          <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
            Datos del cliente
          </h3>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nombre completo"
            required
            error={fieldError("full_name")}
          >
            <input
              type="text"
              name="full_name"
              autoComplete="off"
              placeholder="Ej. Natalia García"
              className={inputCls(!!fieldError("full_name"))}
            />
          </Field>

          <Field
            label="Teléfono"
            required
            error={fieldError("phone")}
          >
            <input
              type="tel"
              name="phone"
              autoComplete="off"
              placeholder="Ej. 3001234567"
              className={inputCls(!!fieldError("phone"))}
            />
          </Field>

          <Field
            label="Dirección de residencia"
            required
            error={fieldError("address")}
          >
            <input
              type="text"
              name="address"
              autoComplete="off"
              placeholder="Calle, ciudad"
              className={inputCls(!!fieldError("address"))}
            />
          </Field>

          <Field
            label="Correo electrónico"
            required
            error={fieldError("email")}
            hint="Será el usuario de inicio de sesión"
          >
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="correo@ejemplo.com"
              className={inputCls(!!fieldError("email"))}
            />
          </Field>

          <Field
            label="Contraseña temporal"
            required
            error={fieldError("password")}
            hint="El cliente deberá cambiarla al ingresar"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className={`${inputCls(!!fieldError("password"))} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>
      </div>

      {/* ── Sección 2: Detalles del evento ────────────────────────── */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
          <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
            Detalles del evento
          </h3>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Tipo de evento"
            required
            error={fieldError("event_type")}
          >
            <select
              name="event_type"
              defaultValue=""
              className={inputCls(!!fieldError("event_type"))}
            >
              <option value="" disabled>
                Seleccionar tipo…
              </option>
              <option value="boda">Boda</option>
              <option value="quince">Quinceañera</option>
              <option value="empresarial">Empresarial</option>
              <option value="revelacion">Revelación de Género</option>
            </select>
          </Field>

          <Field
            label="Fecha del evento"
            required
            error={fieldError("event_date")}
          >
            <input
              type="date"
              name="event_date"
              min={new Date().toISOString().split("T")[0]}
              className={inputCls(!!fieldError("event_date"))}
            />
          </Field>

          <Field
            label="Hora de inicio"
            required
            error={fieldError("event_start_time")}
          >
            <input
              type="time"
              name="event_start_time"
              className={inputCls(!!fieldError("event_start_time"))}
            />
          </Field>

          <Field
            label="Hora de fin"
            required
            error={fieldError("event_end_time")}
            hint="Si es de madrugada ingresa la hora igual (ej. 01:45)"
          >
            <input
              type="time"
              name="event_end_time"
              className={inputCls(!!fieldError("event_end_time"))}
            />
          </Field>

          <Field
            label="Cantidad de invitados"
            required
            error={fieldError("guest_count")}
          >
            <input
              type="number"
              name="guest_count"
              min={1}
              placeholder="Ej. 150"
              className={inputCls(!!fieldError("guest_count"))}
            />
          </Field>
        </div>
      </div>

      {/* ── Botón submit ──────────────────────────────────────────── */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-[0.8rem] text-gris max-w-xs">
          Se creará la cuenta, la reserva y la orden de servicio en un solo
          paso.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-dorado text-blanco text-[0.83rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {isPending
            ? "Creando cliente…"
            : "Crear cliente y generar orden →"}
        </button>
      </div>
    </form>
  );
}
