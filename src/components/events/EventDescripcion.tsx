interface DescripcionConfig {
  text: string;
}

export function EventDescripcion({ config }: { config: DescripcionConfig }) {
  return (
    <section className="py-20 md:py-28 bg-crema">
      <div className="max-w-[760px] mx-auto px-8 text-center">
        <div className="w-[40px] h-px bg-dorado mx-auto mb-10" />
        <p className="font-serif text-[1.2rem] md:text-[1.42rem] font-light text-negro/80 leading-[1.85] italic">
          {config.text}
        </p>
        <div className="w-[40px] h-px bg-dorado mx-auto mt-10" />
      </div>
    </section>
  );
}
