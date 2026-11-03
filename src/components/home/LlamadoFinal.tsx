import Link from "next/link";

export function LlamadoFinal() {
  return (
    <section className="bg-white px-6 py-20 lg:px-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-800 px-8 py-14 text-center text-white sm:px-14">
        <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-24 -left-10 size-64 rounded-full bg-brand-500/20" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Empieza a ver tus cuentas claras</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">Crea tu cuenta gratis y registra tu primer gasto en menos de un minuto.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold text-brand-800 shadow-md transition hover:-translate-y-0.5 hover:bg-menta"
            >
              Crear cuenta gratis
            </Link>
            <Link href="/ayuda" className="rounded-xl border border-white/30 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10">
              Tengo dudas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
