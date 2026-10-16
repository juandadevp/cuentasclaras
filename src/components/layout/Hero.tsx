import { ImagenDeFondo } from "@/components/ui/ImagenDeFondo";

export function Hero() {
  return (
    <section className="bg-menta">
      <div className="mx-auto grid min-h-[calc(50vh-4.5rem)] max-w-7xl items-center gap-4 px-6 py-8 md:grid-cols-2 lg:px-20">
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
            Tus gastos del mes,
            <span className="block text-brand-700">
              por fin claros.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-900/75">
            Registra lo que gastas en segundos, ve a dónde se va tu dinero y mantente dentro de tu
            presupuesto cada mes.
          </p>
        </div>

        <div className="relative h-64 md:h-full md:min-h-72">
          <ImagenDeFondo src="/ilustracion.gif" ajuste="contain" claseImagen="scale-[1.05] md:object-right" />
        </div>
      </div>
    </section>
  );
}
