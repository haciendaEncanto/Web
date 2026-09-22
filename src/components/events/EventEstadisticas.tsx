const stats = [
  { value: "+300", label: "Eventos realizados" },
  { value: "+150", label: "Invitados" },
  { value: "100%", label: "Acompañamiento" },
];

export function EventEstadisticas() {
  return (
    <section className="py-24 bg-blush">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-3 gap-6 sm:gap-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-[2.4rem] sm:text-[3.2rem] font-semibold text-rojo leading-none">
                {s.value}
              </div>
              <div className="text-[0.7rem] sm:text-[0.85rem] text-gris tracking-[0px] sm:tracking-[1px] uppercase mt-2 leading-tight [overflow-wrap:anywhere]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
