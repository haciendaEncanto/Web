export function KpiCard({ label, value, icon: Icon, sub }: {
  label: string; value: number | string; icon: React.ElementType; sub?: string;
}) {
  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] text-gris uppercase tracking-wider mb-1">{label}</p>
          <p className="font-serif text-[2.2rem] text-negro leading-none">{value}</p>
          {sub && <p className="text-[0.75rem] text-gris mt-1.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-dorado/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-dorado" />
        </div>
      </div>
    </div>
  );
}
