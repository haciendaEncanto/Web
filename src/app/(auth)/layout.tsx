export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-crema flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Marca */}
        <div className="text-center mb-10 select-none">
          <span className="block font-serif text-[0.65rem] tracking-[0.35em] text-dorado uppercase mb-1">
            Hacienda
          </span>
          <span className="block font-serif text-[2.1rem] leading-none text-negro tracking-[-0.02em]">
            El Encanto
          </span>
        </div>

        {children}
      </div>
    </main>
  );
}
