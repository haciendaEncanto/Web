"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { updateCotizacionConfig, type ConfigRow } from "@/app/actions/cotizaciones";

const CLAVE_LABELS: Record<string, string> = {
  precio_por_persona:            "Precio por persona",
  costo_fijo_hacienda:           "Costo fijo hacienda",
  costo_adicional:               "Costo adicional",
  costo_base_menos_60:           "Costo base (<60 inv.)",
  ajuste_por_invitado_menos_60:  "Ajuste por invitado (<60)",
  fee_porcentaje:                "Fee (%)",
  descuento_volumen_menor_68:    "Descuento volumen ≤68 (%)",
  descuento_volumen_mayor_69:    "Descuento volumen ≥69 (%)",
  descuento_sabado_noche:        "Descuento sábado noche (%)",
  descuento_viernes:             "Descuento viernes (%)",
  descuento_domingo:             "Descuento domingo (%)",
  descuento_sabado_dia_lunes_jueves: "Descuento sábado día / lunes–jueves (%)",
};

const CURRENCY_CLAVES = new Set([
  "precio_por_persona",
  "costo_fijo_hacienda",
  "costo_adicional",
  "costo_base_menos_60",
  "ajuste_por_invitado_menos_60",
]);

function fmtCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

function ConfigRowItem({ row }: { row: ConfigRow }) {
  const [valor, setValor] = useState(String(row.valor));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) {
      setError("Valor inválido");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateCotizacionConfig(row.clave, num);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  const isCurrency = CURRENCY_CLAVES.has(row.clave);
  const numVal = parseFloat(valor);
  const preview = !isNaN(numVal)
    ? isCurrency
      ? fmtCOP(numVal)
      : `${numVal}%`
    : "";

  return (
    <tr className="border-b border-negro/[0.06] last:border-0">
      <td className="py-3 pr-4">
        <p className="text-[0.83rem] font-medium text-negro">
          {CLAVE_LABELS[row.clave] ?? row.clave}
        </p>
        <p className="text-[0.72rem] text-gris mt-0.5">{row.descripcion}</p>
      </td>
      <td className="py-3 pr-3 w-40">
        <input
          type="number"
          min={0}
          step={isCurrency ? 1000 : 1}
          value={valor}
          onChange={(e) => { setValor(e.target.value); setSaved(false); setError(null); }}
          className="w-full border border-negro/10 focus:border-dorado/70 px-3 py-2 text-[0.83rem] text-negro bg-blanco rounded-lg focus:outline-none transition-colors"
        />
        {preview && (
          <p className="text-[0.7rem] text-gris/60 mt-1 text-right">{preview}</p>
        )}
      </td>
      <td className="py-3 pl-1 w-24 text-right">
        {error ? (
          <p className="text-[0.72rem] text-red-500">{error}</p>
        ) : saved ? (
          <span className="inline-flex items-center gap-1 text-[0.72rem] text-green-600">
            <CheckCircle2 size={12} />
            Guardado
          </span>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-negro text-blanco text-[0.75rem] rounded-lg hover:bg-negro/80 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Guardar
          </button>
        )}
      </td>
    </tr>
  );
}

export function CotizacionConfigManager({ rows }: { rows: ConfigRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-gris text-[0.88rem] py-6 text-center">
        No se encontraron parámetros de configuración.
      </p>
    );
  }

  return (
    <div className="bg-blanco border border-negro/[0.07] rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-negro/[0.08] bg-negro/[0.025]">
            <th className="text-left py-3 px-4 text-[0.72rem] text-gris uppercase tracking-wider font-medium">
              Parámetro
            </th>
            <th className="text-left py-3 px-3 text-[0.72rem] text-gris uppercase tracking-wider font-medium w-40">
              Valor
            </th>
            <th className="text-right py-3 px-4 w-24" />
          </tr>
        </thead>
        <tbody className="px-4">
          {rows.map((row) => (
            <ConfigRowItem key={row.clave} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
