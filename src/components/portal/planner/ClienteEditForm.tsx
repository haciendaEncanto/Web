"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { editarCliente, type EditClientState } from "@/app/actions/editar-cliente";
import { GUEST_COUNT_OPTIONS } from "@/lib/guest-count";
import {
  VARIABLE_ITEM_LABELS,
  VARIABLE_ITEM_TYPES,
  VARIABLE_ITEM_ORDER,
  type ContractItems,
} from "@/lib/contract-items";

const inputCls = (error: boolean) =>
  `w-full border ${
    error ? "border-rojo" : "border-negro/10"
  } bg-crema/20 px-3 py-2.5 text-[0.85rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors placeholder:text-gris/35`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-6 py-4 border-b border-negro/5 bg-crema/30">
        <h3 className="font-serif text-[1rem] text-negro tracking-[-0.01em]">{title}</h3>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  span,
  children,
}: {
  label: string;
  error?: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-[0.74rem] text-rojo mt-1">{error}</p>}
    </div>
  );
}

interface Props {
  clientId: string;
  bookingId: string;
  defaults: {
    full_name: string;
    cc: string;
    phone: string;
    address: string;
    email: string;
    event_type: string;
    event_date: string;
    event_start_time: string;
    event_end_time: string;
    guest_count: number;
    valor_total: string;
    valor_anticipo: string;
    fecha_segundo_abono: string;
    fecha_tercer_abono: string;
    capilla: string;
    contract_items: ContractItems;
  };
  redirectTo?: string;
}

export function ClienteEditForm({
  clientId,
  bookingId,
  defaults,
  redirectTo = "/portal/planner/clientes",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<EditClientState>(null);

  // Perfil
  const [fullName, setFullName] = useState(defaults.full_name);
  const [cc, setCc] = useState(defaults.cc);
  const [phone, setPhone] = useState(defaults.phone);
  const [address, setAddress] = useState(defaults.address);
  const [email, setEmail] = useState(defaults.email);

  // Evento
  const [eventType, setEventType] = useState(defaults.event_type);
  const [eventDate, setEventDate] = useState(defaults.event_date);
  const [startTime, setStartTime] = useState(defaults.event_start_time);
  const [endTime, setEndTime] = useState(defaults.event_end_time);
  const [guestCount, setGuestCount] = useState(String(defaults.guest_count));

  // Financiero
  const [valorTotal, setValorTotal] = useState(defaults.valor_total);
  const [valorAnticipo, setValorAnticipo] = useState(defaults.valor_anticipo);
  const [fechaSegundoAbono, setFechaSegundoAbono] = useState(defaults.fecha_segundo_abono);
  const [fechaTercerAbono, setFechaTercerAbono] = useState(defaults.fecha_tercer_abono);
  const [capilla, setCapilla] = useState(defaults.capilla);

  // Ítems del contrato
  const [items, setItems] = useState<ContractItems>(defaults.contract_items);

  const setItem = (key: keyof ContractItems, value: string | boolean) =>
    setItems((prev) => ({ ...prev, [key]: value }));

  const fieldError = (f: string): string | undefined =>
    state && "error" in state && state.field === f ? state.error : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("full_name",           fullName);
    fd.set("cc",                  cc);
    fd.set("phone",               phone);
    fd.set("address",             address);
    fd.set("email",               email);
    fd.set("event_type",          eventType);
    fd.set("event_date",          eventDate);
    fd.set("event_start_time",    startTime);
    fd.set("event_end_time",      endTime);
    fd.set("guest_count",         guestCount);
    fd.set("valor_total",         valorTotal);
    fd.set("valor_anticipo",      valorAnticipo);
    fd.set("fecha_segundo_abono", fechaSegundoAbono);
    fd.set("fecha_tercer_abono",  fechaTercerAbono);
    fd.set("capilla",             capilla);
    fd.set("contract_items",      JSON.stringify(items));

    startTransition(async () => {
      const res = await editarCliente(clientId, bookingId, fd);
      setState(res);
      if (res && "success" in res) {
        setTimeout(() => router.push(redirectTo), 1200);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos del cliente */}
      <Section title="Datos del cliente">
        <Field label="Nombre completo" error={fieldError("full_name")} span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls(!!fieldError("full_name"))}
          />
        </Field>
        <Field label="CC / Cédula" error={fieldError("cc")}>
          <input
            type="text"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            className={inputCls(!!fieldError("cc"))}
          />
        </Field>
        <Field label="Teléfono" error={fieldError("phone")}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls(!!fieldError("phone"))}
          />
        </Field>
        <Field label="Correo electrónico" error={fieldError("email")}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls(!!fieldError("email"))}
          />
        </Field>
        <Field label="Dirección" error={fieldError("address")} span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputCls(!!fieldError("address"))}
          />
        </Field>
      </Section>

      {/* Datos del evento */}
      <Section title="Datos del evento">
        <Field label="Tipo de evento" error={fieldError("event_type")}>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={inputCls(!!fieldError("event_type"))}
          >
            <option value="boda">Boda</option>
            <option value="quince">Quinceañera</option>
            <option value="empresarial">Empresarial</option>
            <option value="revelacion">Revelación de Género</option>
          </select>
        </Field>
        <Field label="Fecha del evento" error={fieldError("event_date")}>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={inputCls(!!fieldError("event_date"))}
          />
        </Field>
        <Field label="Hora de inicio" error={fieldError("event_start_time")}>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputCls(!!fieldError("event_start_time"))}
          />
        </Field>
        <Field label="Hora de fin" error={fieldError("event_end_time")}>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputCls(!!fieldError("event_end_time"))}
          />
        </Field>
        <Field label="Cantidad de invitados" error={fieldError("guest_count")}>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className={inputCls(!!fieldError("guest_count"))}
          >
            {!GUEST_COUNT_OPTIONS.includes(Number(guestCount) as (typeof GUEST_COUNT_OPTIONS)[number]) && (
              <option value={guestCount}>{guestCount}</option>
            )}
            {GUEST_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Capilla" error={fieldError("capilla")}>
          <select
            value={capilla}
            onChange={(e) => setCapilla(e.target.value)}
            className={inputCls(!!fieldError("capilla"))}
          >
            <option value="">Sin definir</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </Field>
      </Section>

      {/* Datos financieros */}
      <Section title="Valores y pagos">
        <Field label="Valor total del evento (sin IVA)" error={fieldError("valor_total")}>
          <input
            type="number"
            min="0"
            step="1000"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            placeholder="Ej. 15000000"
            className={inputCls(!!fieldError("valor_total"))}
          />
        </Field>
        <Field label="Primer anticipo" error={fieldError("valor_anticipo")}>
          <input
            type="number"
            min="0"
            step="1000"
            value={valorAnticipo}
            onChange={(e) => setValorAnticipo(e.target.value)}
            placeholder="Ej. 3000000"
            className={inputCls(!!fieldError("valor_anticipo"))}
          />
        </Field>
        <Field label="Fecha 2.° abono" error={fieldError("fecha_segundo_abono")}>
          <input
            type="date"
            value={fechaSegundoAbono}
            onChange={(e) => setFechaSegundoAbono(e.target.value)}
            className={inputCls(!!fieldError("fecha_segundo_abono"))}
          />
        </Field>
        <Field label="Fecha 3.° abono" error={fieldError("fecha_tercer_abono")}>
          <input
            type="date"
            value={fechaTercerAbono}
            onChange={(e) => setFechaTercerAbono(e.target.value)}
            className={inputCls(!!fieldError("fecha_tercer_abono"))}
          />
        </Field>
      </Section>

      {/* Ítems del contrato */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/5 bg-crema/30">
          <h3 className="font-serif text-[1rem] text-negro tracking-[-0.01em]">
            Ítems del contrato
          </h3>
          <p className="text-[0.75rem] text-gris mt-0.5">
            Activa o desactiva cada ítem e ingresa cantidades donde aplique
          </p>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VARIABLE_ITEM_ORDER.map((key) => {
            const type = VARIABLE_ITEM_TYPES[key];
            const label = VARIABLE_ITEM_LABELS[key];
            const boolVal = items[key] as boolean;
            const strVal = items[key] as string;

            if (type === "sino-fixed-1") {
              return (
                <div key={key}>
                  <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={boolVal ? "si" : "no"}
                      onChange={(e) => setItem(key, e.target.value === "si")}
                      className={inputCls(false)}
                    >
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                    {boolVal && (
                      <span className="shrink-0 text-[0.78rem] text-gris bg-negro/5 px-2.5 py-2 rounded-lg">
                        1 unidad
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            if (type === "sino") {
              return (
                <div key={key}>
                  <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <select
                    value={boolVal ? "si" : "no"}
                    onChange={(e) => setItem(key, e.target.value === "si")}
                    className={inputCls(false)}
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
              );
            }

            if (type === "cantidad") {
              return (
                <div key={key}>
                  <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={strVal}
                    onChange={(e) => setItem(key, e.target.value)}
                    placeholder="0"
                    className={inputCls(false)}
                  />
                </div>
              );
            }

            // tipo "texto"
            return (
              <div key={key}>
                <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  value={strVal}
                  onChange={(e) => setItem(key, e.target.value)}
                  placeholder="Según cotización"
                  className={inputCls(false)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Error global */}
      {state && "error" in state && !state.field && (
        <p className="text-[0.82rem] text-rojo bg-rojo/5 border border-rojo/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      {/* Barra de acciones */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] px-6 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push(redirectTo)}
          disabled={isPending}
          className="px-4 py-2.5 text-[0.82rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <div className="flex items-center gap-3">
          {state && "success" in state && (
            <span className="flex items-center gap-1.5 text-[0.78rem] text-green-600">
              <CheckCircle2 size={14} />
              Guardado — redirigiendo…
            </span>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  );
}
