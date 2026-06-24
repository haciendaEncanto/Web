import { CalendarDays } from "lucide-react";

export default function PlannerPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Panel <span className="text-dorado">Wedding Planner</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Gestión de eventos y agenda
        </p>
      </div>
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
        <CalendarDays size={40} className="text-dorado/50 mx-auto mb-4" />
        <p className="font-serif text-[1.3rem] text-negro mb-2">
          Módulo en construcción
        </p>
        <p className="text-gris text-[0.87rem] max-w-[340px] mx-auto">
          El panel de wedding planner estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
