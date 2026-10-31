import { ImagenDeFondo } from "@/components/ui/ImagenDeFondo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-menta">
      <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-white/30" />
      <div aria-hidden className="absolute -bottom-32 right-40 size-72 rounded-full bg-brand-500/10" />
      <div className="relative mx-auto grid min-h-[calc(50vh-4.5rem)] max-w-7xl items-center gap-4 px-6 py-12 md:grid-cols-[0.85fr_1.15fr] lg:px-20">
        <div className="md:order-2">
          <h1 className="text-5xl font-extrabold leading-[1.03] tracking-tight text-foreground sm:text-6xl xl:text-[68px]">
            Tus gastos del mes,
            <span className="block text-brand-700">
              por fin claros.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed lg:text-2xl text-brand-800/75">
            Registra lo que gastas en segundos, ve a dónde se va tu dinero y mantente dentro de tu
            presupuesto cada mes.
          </p>
        </div>

        <div className="relative h-80 md:order-1 md:h-full md:min-h-[26rem]">
          <ImagenDeFondo src="/ilustracion.gif" ajuste="contain" claseImagen="scale-110 md:object-left" />
        </div>
      </div>
    </section>
  );
}
