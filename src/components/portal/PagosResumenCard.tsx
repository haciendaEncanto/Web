function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PagosResumenCard({
  totalAmount,
  totalConfirmed,
}: {
  totalAmount: number;
  totalConfirmed: number;
}) {
  const saldo = Math.max(totalAmount - totalConfirmed, 0);
  const pct = totalAmount > 0 ? Math.min(Math.round((totalConfirmed / totalAmount) * 100), 100) : 0;

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[0.68rem] text-gris uppercase tracking-wider mb-1">Valor total del evento</p>
          <p className="font-serif text-[1.6rem] text-negro">{formatCOP(totalAmount)}</p>
        </div>
        <div>
          <p className="text-[0.68rem] text-gris uppercase tracking-wider mb-1">Total abonado</p>
          <p className="font-serif text-[1.6rem] text-green-600">{formatCOP(totalConfirmed)}</p>
        </div>
        <div>
          <p className="text-[0.68rem] text-gris uppercase tracking-wider mb-1">Saldo pendiente</p>
          <p className="font-serif text-[1.6rem] text-rojo">{formatCOP(saldo)}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.72rem] text-gris">Progreso de pago</span>
          <span className="text-[0.72rem] font-semibold text-negro tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 bg-negro/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-dorado rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
