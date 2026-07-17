"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Download, CheckCircle2, Clock3 } from "lucide-react";
import { registrarPago, confirmarPago, getComprobanteDownloadUrl, type RegistrarPagoData } from "@/app/actions/pagos";
import { PagosResumenCard } from "@/components/portal/PagosResumenCard";

const METHOD_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
];

const METHOD_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  cheque: "Cheque",
  otro: "Otro",
};

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

type Pago = {
  id: string;
  concept: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  notes: string | null;
  receipt_url: string | null;
};

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function EstadoBadge({ status, hasReceipt }: { status: string; hasReceipt: boolean }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium px-2 py-0.5 rounded-full border text-green-700 bg-green-50 border-green-200">
        <CheckCircle2 size={11} /> Confirmado
      </span>
    );
  }
  if (hasReceipt) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium px-2 py-0.5 rounded-full border text-blue-700 bg-blue-50 border-blue-200">
        <Clock3 size={11} /> Con comprobante
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200">
      <Clock3 size={11} /> Pendiente
    </span>
  );
}

function RegistrarPagoForm({ bookingId, onDone, onCancel }: { bookingId: string; onDone: (payment: Pago) => void; onCancel: () => void }) {
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("transferencia");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) { setError("El monto debe ser mayor a cero"); return; }

    const data: RegistrarPagoData = {
      bookingId,
      concept,
      amount: amountNum,
      payment_date: date,
      payment_method: method as RegistrarPagoData["payment_method"],
      notes: notes || undefined,
    };
    startTransition(async () => {
      const res = await registrarPago(data);
      if (res.error || !res.payment) { setError(res.error ?? "Error al registrar el pago"); return; }
      onDone(res.payment);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-3">
      <h4 className="font-serif text-[0.95rem] text-negro">Registrar pago</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Concepto *</label>
          <input type="text" value={concept} onChange={(e) => setConcept(e.target.value)} required
            placeholder="Ej: Abono inicial, Pago final…" className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Monto *</label>
          <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Fecha *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Método de pago *</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
            {METHOD_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="Observaciones opcionales…" className={`${inputCls} resize-none`} />
        </div>
      </div>
      {error && <p className="text-[0.78rem] text-rojo">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} disabled={isPending}
          className="px-3 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50">
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {isPending ? "Guardando…" : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}

function DownloadComprobanteBtn({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition();
  function handle() {
    startTransition(async () => {
      const res = await getComprobanteDownloadUrl(paymentId);
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    });
  }
  return (
    <button onClick={handle} disabled={isPending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[0.74rem] text-negro/60 border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50">
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      Comprobante
    </button>
  );
}

function ConfirmarPagoBtn({ paymentId, onConfirmed }: { paymentId: string; onConfirmed: () => void }) {
  const [isPending, startTransition] = useTransition();
  function handle() {
    startTransition(async () => {
      const res = await confirmarPago(paymentId);
      if (!res.error) onConfirmed();
    });
  }
  return (
    <button onClick={handle} disabled={isPending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[0.74rem] font-medium text-green-700 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
      Confirmar pago
    </button>
  );
}

export function PagosPlanner({
  bookingId,
  totalAmount,
  initialPagos,
}: {
  bookingId: string;
  totalAmount: number;
  initialPagos: Pago[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [pagos, setPagos] = useState(initialPagos);
  const router = useRouter();

  const totalConfirmed = pagos
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PagosResumenCard totalAmount={totalAmount} totalConfirmed={totalConfirmed} />

      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
          <Plus size={15} />
          Registrar pago
        </button>
      )}

      {showForm && (
        <RegistrarPagoForm
          bookingId={bookingId}
          onDone={(payment) => {
            setPagos((prev) => [payment, ...prev]);
            setShowForm(false);
            router.refresh(); // sincroniza en background; la UI ya quedó actualizada arriba
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {pagos.length === 0 && !showForm ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-8 text-center">
          <p className="text-gris text-[0.85rem]">Sin pagos registrados aún.</p>
        </div>
      ) : (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-negro/[0.06] bg-crema/40">
                  <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Concepto</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Monto</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Método</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Estado</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-crema/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-[0.85rem] font-medium text-negro">{p.concept ?? "—"}</p>
                      {p.notes && <p className="text-[0.72rem] text-gris mt-0.5">{p.notes}</p>}
                    </td>
                    <td className="px-4 py-4 text-[0.85rem] text-negro">{formatCOP(p.amount)}</td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris">{METHOD_LABEL[p.payment_method] ?? p.payment_method}</td>
                    <td className="px-4 py-4">
                      <EstadoBadge status={p.status} hasReceipt={!!p.receipt_url} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.receipt_url && <DownloadComprobanteBtn paymentId={p.id} />}
                        {p.status === "pending" && p.receipt_url && (
                          <ConfirmarPagoBtn
                            paymentId={p.id}
                            onConfirmed={() => {
                              setPagos((prev) => prev.map((pago) => pago.id === p.id ? { ...pago, status: "confirmed" } : pago));
                              router.refresh();
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
