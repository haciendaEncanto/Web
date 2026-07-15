"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2, Clock3 } from "lucide-react";
import { requestComprobanteUpload, confirmComprobanteUpload } from "@/app/actions/pagos";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";
import { PagosResumenCard } from "@/components/portal/PagosResumenCard";

const MAX_BYTES = 10 * 1024 * 1024;

const METHOD_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  cheque: "Cheque",
  otro: "Otro",
};

type Pago = {
  id: string;
  concept: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
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
        <Clock3 size={11} /> En revisión
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200">
      <Clock3 size={11} /> Pendiente
    </span>
  );
}

function SubirComprobanteBtn({ bookingId, paymentId }: { bookingId: string; paymentId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Solo se aceptan archivos PDF"); return; }
    if (f.size > MAX_BYTES) { setError("El archivo supera 10 MB"); return; }

    setUploading(true);
    setError(null);
    try {
      const req = await requestComprobanteUpload({
        bookingId, fileName: f.name, contentType: f.type, size: f.size,
      });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setError(req.error ?? "No se pudo iniciar la subida");
        return;
      }
      const upErr = await uploadFileToSignedUrl("documents", req.path, req.token, f);
      if (upErr.error) { setError(upErr.error); return; }

      const result = await confirmComprobanteUpload({ paymentId, bookingId, path: req.path });
      if (result.error) { setError(result.error); return; }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      <button
        type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-dorado text-blanco text-[0.78rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        Subir comprobante
      </button>
      {error && <p className="text-[0.7rem] text-rojo max-w-[180px] text-right">{error}</p>}
    </div>
  );
}

export function PagosClienteView({
  bookingId,
  totalAmount,
  pagos,
}: {
  bookingId: string;
  totalAmount: number;
  pagos: Pago[];
}) {
  const totalConfirmed = pagos
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PagosResumenCard totalAmount={totalAmount} totalConfirmed={totalConfirmed} />

      {pagos.length === 0 ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
          <p className="text-gris text-[0.85rem]">
            Aún no hay pagos registrados para tu evento.
          </p>
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
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-crema/20 transition-colors">
                    <td className="px-5 py-4 text-[0.85rem] font-medium text-negro">{p.concept ?? "—"}</td>
                    <td className="px-4 py-4 text-[0.85rem] text-negro">{formatCOP(p.amount)}</td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris">{METHOD_LABEL[p.payment_method] ?? p.payment_method}</td>
                    <td className="px-4 py-4">
                      <EstadoBadge status={p.status} hasReceipt={!!p.receipt_url} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        {p.status === "pending" && !p.receipt_url && (
                          <SubirComprobanteBtn bookingId={bookingId} paymentId={p.id} />
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
