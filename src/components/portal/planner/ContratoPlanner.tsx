"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Download, Loader2, CheckCircle2, AlertTriangle, Lock, ScrollText,
} from "lucide-react";
import { generarContratoPDF } from "@/app/actions/admin/generar-contrato";
import { getDocumentoDownloadUrl } from "@/app/actions/documentos";
import type { DocumentoConSize } from "@/app/actions/documentos";

interface Prereq {
  ok: boolean;
  label: string;
  hint: string;
}

interface Props {
  clientId: string;
  bookingId: string | null;
  clientName: string;
  prereqs: Prereq[];
  isLocked: boolean;
  initialContratos: DocumentoConSize[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DownloadBtn({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const res = await getDocumentoDownloadUrl(id);
          if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
        })
      }
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-negro/15 text-[0.78rem] text-negro rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      Descargar
    </button>
  );
}

export function ContratoPlanner({
  clientId,
  bookingId,
  clientName,
  prereqs,
  isLocked,
  initialContratos,
}: Props) {
  const router = useRouter();
  const [contratos, setContratos] = useState(initialContratos);
  const [otroSi, setOtroSi] = useState("");
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState("");
  const [generated, setGenerated] = useState(false);

  const allPrereqsMet = prereqs.every((p) => p.ok);
  const canGenerate = allPrereqsMet && !isLocked && !!bookingId;

  async function handleGenerar() {
    if (!canGenerate) return;
    setErr("");
    setGenerated(false);
    setGenerating(true);
    try {
      const res = await generarContratoPDF(clientId, otroSi || undefined);
      if (res.error) { setErr(res.error); return; }
      setGenerated(true);
      setOtroSi("");
      const newDoc: DocumentoConSize = {
        id: res.documentId!,
        title: `Contrato de servicios v${contratos.length + 1} — ${new Date().toLocaleDateString("es-CO")}`,
        type: "contrato",
        created_at: new Date().toISOString(),
        size: null,
      };
      setContratos((prev) => [newDoc, ...prev]);
      router.refresh();
      setTimeout(() => setGenerated(false), 3000);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Estado bloqueado */}
      {isLocked && (
        <div className="flex items-start gap-3 bg-negro/5 border border-negro/10 rounded-2xl px-5 py-4">
          <Lock size={16} className="text-negro/40 mt-0.5 shrink-0" />
          <div>
            <p className="text-[0.85rem] text-negro font-medium">Contrato firmado por el cliente</p>
            <p className="text-[0.8rem] text-gris mt-0.5">
              El cliente ya subió el contrato firmado. No se pueden generar nuevas versiones.
            </p>
          </div>
        </div>
      )}

      {/* Prerequisitos */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30 flex items-center gap-2">
          <ScrollText size={14} className="text-dorado" />
          <h3 className="font-serif text-[0.9rem] text-negro">
            Requisitos para generar el contrato
          </h3>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {prereqs.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {p.ok ? (
                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className={`text-[0.82rem] ${p.ok ? "text-negro" : "text-negro/70"}`}>
                  {p.label}
                </p>
                {!p.ok && (
                  <p className="text-[0.74rem] text-gris">{p.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Otro sí */}
      {!isLocked && (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30">
            <h3 className="font-serif text-[0.9rem] text-negro">Otro sí (opcional)</h3>
            <p className="text-[0.73rem] text-gris mt-0.5">
              Acuerdo adicional o modificación que se incluirá al final del contrato
            </p>
          </div>
          <div className="p-5">
            <textarea
              value={otroSi}
              onChange={(e) => setOtroSi(e.target.value)}
              rows={3}
              disabled={!canGenerate}
              placeholder="Dejar en blanco si no hay modificaciones adicionales…"
              className="w-full border border-negro/10 bg-crema/10 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors resize-y leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Botón generar */}
      {!isLocked && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerar}
            disabled={!canGenerate || generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-dorado text-blanco text-[0.85rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating && <Loader2 size={14} className="animate-spin" />}
            {generating ? "Generando contrato…" : contratos.length > 0 ? "Generar nueva versión" : "Generar contrato"}
          </button>
          {generated && (
            <span className="flex items-center gap-1.5 text-[0.8rem] text-green-600">
              <CheckCircle2 size={14} />
              ¡Contrato generado! El cliente fue notificado.
            </span>
          )}
        </div>
      )}

      {err && (
        <p className="text-[0.82rem] text-rojo bg-rojo/5 border border-rojo/20 rounded-xl px-4 py-3">
          {err}
        </p>
      )}

      {/* Historial de contratos generados */}
      {contratos.length > 0 && (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30">
            <h3 className="font-serif text-[0.9rem] text-negro">
              Versiones generadas{" "}
              <span className="text-gris text-[0.78rem] font-normal">
                ({contratos.length})
              </span>
            </h3>
          </div>
          <div className="divide-y divide-negro/[0.04]">
            {contratos.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-crema/20 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-dorado/60 shrink-0" />
                  <div>
                    <p className="text-[0.83rem] text-negro font-medium">{c.title}</p>
                    <p className="text-[0.73rem] text-gris">
                      {formatDate(c.created_at)}
                      {c.size && ` · ${formatBytes(c.size)}`}
                      {i === 0 && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] bg-dorado/10 text-dorado font-medium">
                          Más reciente
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <DownloadBtn id={c.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {contratos.length === 0 && !generating && (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
          <FileText size={28} className="text-dorado/30 mx-auto mb-3" />
          <p className="text-[0.85rem] text-gris">
            Aún no se ha generado ningún contrato para{" "}
            <span className="text-negro">{clientName}</span>.
          </p>
          {!allPrereqsMet && (
            <p className="text-[0.78rem] text-amber-600 mt-2">
              Completa los requisitos indicados arriba para habilitarlo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
