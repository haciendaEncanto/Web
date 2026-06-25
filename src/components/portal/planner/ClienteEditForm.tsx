"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { editarCliente, type EditClientState } from "@/app/actions/editar-cliente";

const inputCls = (error: boolean) =>
  `w-full border ${
    error ? "border-rojo" : "border-negro/10"
  } bg-crema/20 px-3 py-2.5 text-[0.85rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors placeholder:text-gris/35`;

interface Props {
  clientId: string;
  bookingId: string;
  defaults: {
    full_name: string;
    phone: string;
    address: string;
    email: string;
    event_type: string;
    event_date: string;
    event_start_time: string;
    event_end_time: string;
    guest_count: number;
  };
}

export function ClienteEditForm({ clientId, bookingId, defaults }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<EditClientState>(null);

  // Perfil
  const [fullName, setFullName] = useState(defaults.full_name);
  const [phone, setPhone] = useState(defaults.phone);
  const [address, setAddress] = useState(defaults.address);
  const [email, setEmail] = useState(defaults.email);

  // Evento
  const [eventType, setEventType] = useState(defaults.event_type);
  const [eventDate, setEventDate] = useState(defaults.event_date);
  const [startTime, setStartTime] = useState(defaults.event_start_time);
  const [endTime, setEndTime] = useState(defaults.event_end_time);
  const [guestCount, setGuestCount] = useState(String(defaults.guest_count));

  const fieldError = (f: string) =>
    state && "field" in state && state.field === f;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("full_name",        fullName);
    fd.set("phone",            phone);
    fd.set("address",          address);
    fd.set("email",            email);
    fd.set("event_type",       eventType);
    fd.set("event_date",       eventDate);
    fd.set("event_start_time", startTime);
    fd.set("event_end_time",   endTime);
    fd.set("guest_count",      guestCount);

    startTransition(async () => {
      const res = await editarCliente(clientId, bookingId, fd);
      setState(res);
      if (res && "success" in res) {
        setTimeout(() => router.push("/portal/planner/clientes"), 1200);
      }
    });
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
        <h3 className="font-serif text-[1rem] text-negro tracking-[-0.01em]">{title}</h3>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const Field = ({
    label,
    field,
    span,
    children,
  }: {
    label: string;
    field: string;
    span?: boolean;
    children: React.ReactNode;
  }) => (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {fieldError(field) && state && "error" in state && (
        <p className="text-[0.74rem] text-rojo mt-1">{state.error}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos del cliente */}
      <Section title="Datos del cliente">
        <Field label="Nombre completo" field="full_name" span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls(!!fieldError("full_name"))}
          />
        </Field>
        <Field label="Teléfono" field="phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls(!!fieldError("phone"))}
          />
        </Field>
        <Field label="Correo electrónico" field="email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls(!!fieldError("email"))}
          />
        </Field>
        <Field label="Dirección" field="address" span>
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
        <Field label="Tipo de evento" field="event_type">
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
        <Field label="Fecha del evento" field="event_date">
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={inputCls(!!fieldError("event_date"))}
          />
        </Field>
        <Field label="Hora de inicio" field="event_start_time">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputCls(!!fieldError("event_start_time"))}
          />
        </Field>
        <Field label="Hora de fin" field="event_end_time">
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputCls(!!fieldError("event_end_time"))}
          />
        </Field>
        <Field label="Cantidad de invitados" field="guest_count">
          <input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className={inputCls(!!fieldError("guest_count"))}
          />
        </Field>
      </Section>

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
          onClick={() => router.push("/portal/planner/clientes")}
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
