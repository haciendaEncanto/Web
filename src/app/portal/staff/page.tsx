import { Users } from "lucide-react";

export default function StaffPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Panel <span className="text-dorado">Staff</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Reservas y orden del día
        </p>
      </div>
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
        <Users size={40} className="text-dorado/50 mx-auto mb-4" />
        <p className="font-serif text-[1.3rem] text-negro mb-2">
          Módulo en construcción
        </p>
        <p className="text-gris text-[0.87rem] max-w-[340px] mx-auto">
          El panel de staff estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
