"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { saveContractItems } from "@/app/actions/contrato-items";
import { VARIABLE_ITEM_LABELS, type ContractItems } from "@/lib/contract-items";

interface Props {
  bookingId: string;
  initialItems: ContractItems;
  initialCapilla: boolean;
  isLocked: boolean;
}

type BoolKey =
  | "dj" | "maestro_ceremonias"
  | "sonido" | "luces" | "pista_baile" | "gaseosa_agua" | "coctel"
  | "barman" | "aseo" | "planner" | "estacion_cafe" | "kit_boda" | "mobiliario";

const BOOL_ITEMS: BoolKey[] = [
  "dj", "maestro_ceremonias",
  "sonido", "luces", "pista_baile",
  "gaseosa_agua", "coctel",
  "barman", "aseo", "planner", "estacion_cafe", "kit_boda", "mobiliario",
];

type CantidadKey = "menu" | "pastel" | "mesa_dulces" | "canelazo" | "champana" | "whisky" | "meseros" | "menaje";
const CANTIDAD_ITEMS: CantidadKey[] = [
  "menu", "pastel", "mesa_dulces", "canelazo", "champana", "whisky", "meseros", "menaje",
];

function Checkmark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ToggleBtnProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function ToggleBtn({ label, checked, disabled, onToggle }: ToggleBtnProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[0.8rem] transition-colors",
        checked
          ? "bg-dorado/10 border-dorado/30 text-negro"
          : "bg-negro/[0.03] border-negro/10 text-negro/50",
        disabled ? "cursor-default opacity-60" : "cursor-pointer hover:border-dorado/40",
      ].join(" ")}
    >
      <div className={[
        "w-4 h-4 rounded flex items-center justify-center shrink-0 border",
        checked ? "bg-dorado border-dorado" : "border-negro/20 bg-transparent",
      ].join(" ")}>
        {checked && <Checkmark />}
      </div>
      {label}
    </button>
  );
}

export function ContractItemsForm({
  bookingId,
  initialItems,
  initialCapilla,
  isLocked,
}: Props) {
  const [items, setItems] = useState<ContractItems>(initialItems);
  const [capilla, setCapilla] = useState(initialCapilla);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggle(key: BoolKey) {
    if (isLocked) return;
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setCantidad(key: CantidadKey, val: string) {
    if (isLocked) return;
    setItems((prev) => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    setErr("");
    setSaved(false);
    startTransition(async () => {
      const res = await saveContractItems(bookingId, items, capilla);
      if (res.error) {
        setErr(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30">
        <h3 className="font-serif text-[0.9rem] text-negro">Servicios del evento</h3>
        <p className="text-[0.73rem] text-gris mt-0.5">
          Define los ítems que aparecerán en la tabla del contrato
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* ─── Servicios (Sí/No) ─── */}
        <div>
          <p className="text-[0.7rem] font-semibold text-gris/70 uppercase tracking-wider mb-2.5">
            Servicios
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BOOL_ITEMS.map((key) => (
              <ToggleBtn
                key={key}
                label={VARIABLE_ITEM_LABELS[key]}
                checked={items[key] as boolean}
                disabled={isLocked}
                onToggle={() => toggle(key)}
              />
            ))}
            <ToggleBtn
              label="Capilla"
              checked={capilla}
              disabled={isLocked}
              onToggle={() => !isLocked && setCapilla((v) => !v)}
            />
          </div>
        </div>

        <div className="border-t border-negro/[0.05]" />

        {/* ─── Cantidades ─── */}
        <div>
          <p className="text-[0.7rem] font-semibold text-gris/70 uppercase tracking-wider mb-2.5">
            Cantidades
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CANTIDAD_ITEMS.map((key) => (
              <div key={key}>
                <label className="text-[0.71rem] text-gris block mb-1">
                  {VARIABLE_ITEM_LABELS[key]}
                </label>
                <input
                  type="number"
                  min="0"
                  value={items[key] as string}
                  onChange={(e) => setCantidad(key, e.target.value)}
                  disabled={isLocked}
                  className="w-full border border-negro/10 bg-crema/10 px-2.5 py-1.5 text-[0.82rem] text-negro rounded-lg focus:outline-none focus:border-dorado/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-negro/[0.05]" />

        {/* ─── Texto libre ─── */}
        <div>
          <p className="text-[0.7rem] font-semibold text-gris/70 uppercase tracking-wider mb-2.5">
            Otros
          </p>
          <div className="max-w-xs">
            <label className="text-[0.71rem] text-gris block mb-1">
              {VARIABLE_ITEM_LABELS.tarjetas_invitacion}
            </label>
            <input
              type="text"
              value={items.tarjetas_invitacion}
              onChange={(e) =>
                !isLocked &&
                setItems((prev) => ({ ...prev, tarjetas_invitacion: e.target.value }))
              }
              disabled={isLocked}
              placeholder="Según cotización"
              className="w-full border border-negro/10 bg-crema/10 px-2.5 py-1.5 text-[0.82rem] text-negro rounded-lg focus:outline-none focus:border-dorado/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      {!isLocked && (
        <div className="px-5 py-3.5 border-t border-negro/5 bg-crema/20 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-negro text-crema text-[0.82rem] font-medium rounded-xl hover:bg-negro/85 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {isPending ? "Guardando…" : "Guardar ítems"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-[0.78rem] text-green-600">
              <CheckCircle2 size={13} />
              Guardado
            </span>
          )}
          {err && (
            <span className="text-[0.78rem] text-rojo">{err}</span>
          )}
        </div>
      )}
    </div>
  );
}
