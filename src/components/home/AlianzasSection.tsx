import { User } from "lucide-react";

type AlianzaRow = {
  id: string;
  nombre: string;
  cargo: string;
  frase: string | null;
  foto_url: string | null;
};

export function AlianzasSection({ aliados }: { aliados: AlianzaRow[] }) {
  if (aliados.length === 0) return null;

  const gridCls = [
    "grid gap-10",
    aliados.length === 1
      ? "grid-cols-1 max-w-xs mx-auto"
      : aliados.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto"
      : aliados.length === 4
      ? "grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  ].join(" ");

  return (
    <section className="py-20 bg-crema/30">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            Aliados
          </p>
          <h2 className="font-serif text-[2.4rem] md:text-[3rem] font-light text-negro tracking-[-0.03em] leading-[1.1]">
            Con quienes confiamos{" "}
            <em className="text-dorado not-italic">tu momento especial</em>
          </h2>
          <p className="text-negro/55 text-[0.92rem] mt-4 max-w-[520px] mx-auto leading-relaxed">
            Profesionales externos de confianza que recomendamos para complementar tu evento
          </p>
          <div className="w-[50px] h-px bg-dorado mx-auto mt-6" />
        </div>

        {/* Cards */}
        <div className={gridCls}>
          {aliados.map((a) => (
            <div key={a.id} className="flex flex-col items-center text-center p-6">
              {/* Foto circular */}
              <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-dorado/30 bg-dorado/5 flex items-center justify-center shrink-0">
                {a.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.foto_url}
                    alt={a.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={36} className="text-dorado/40" />
                )}
              </div>

              {/* Nombre */}
              <p className="font-medium text-negro text-[1.05rem] mt-4 leading-snug">
                {a.nombre}
              </p>

              {/* Especialidad */}
              <p className="text-[0.85rem] mt-0.5 font-medium" style={{ color: "#C9A84C" }}>
                {a.cargo}
              </p>

              {/* Frase */}
              {a.frase && (
                <p className="text-[0.83rem] text-negro/50 mt-2 leading-relaxed max-w-[220px] italic">
                  &ldquo;{a.frase}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Texto informativo */}
        <p
          className="text-center mt-10 text-sm"
          style={{ fontFamily: "Helvetica, Arial, sans-serif", color: "#5A5A58" }}
        >
          De la mano con los mejores profesionales externos, seleccionados con cuidado, para que cada detalle de tu evento sea perfecto.
        </p>
      </div>
    </section>
  );
}
