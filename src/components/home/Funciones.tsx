import Image from "next/image";

const funciones: { numero: string; titulo: string; texto: string; imagen: { src: string; ancho: number; alto: number; alt: string } }[] = [
  {
    numero: "01",
    titulo: "Registro rápido",
    texto: "Anota un gasto en menos de 5 segundos desde el celular o el computador.",
    imagen: { src: "/funciones/registro-recorte.png", ancho: 808, alto: 456, alt: "Pantalla para registrar un gasto" },
  },
  {
    numero: "02",
    titulo: "Gráficos y reportes",
    texto: "Visualiza por categoría y compara mes a mes para detectar fugas de dinero.",
    imagen: { src: "/funciones/graficos-recorte.png", ancho: 568, alto: 582, alt: "Gráficos de gastos por categoría y por mes" },
  },
  {
    numero: "03",
    titulo: "Ahorro mes a mes",
    texto: "Compara cada mes con el anterior y mira cuánto has ahorrado.",
    imagen: { src: "/funciones/ahorro-recorte.png", ancho: 568, alto: 374, alt: "Pantalla Mi ahorro con la comparación mensual" },
  },
];

export function Funciones() {
  return (
    <section id="funciones" className="scroll-mt-20 bg-neutral-50 px-6 py-16 lg:px-20">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Todo lo que necesitas para controlar tu dinero
        </h2>
        <p className="mt-3 text-lg text-muted">Simple para empezar, potente para entender tus finanzas.</p>

        <ul className="mt-12 grid gap-6 text-left md:grid-cols-3">
          {funciones.map((f) => (
            <li
              key={f.titulo}
              className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex h-64 items-center justify-center bg-menta p-4">
                <Image
                  src={f.imagen.src}
                  alt={f.imagen.alt}
                  width={f.imagen.ancho}
                  height={f.imagen.alto}
                  unoptimized
                  className="max-h-full w-auto max-w-full rounded-xl object-contain shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-7">
                <p className="text-sm font-bold tracking-widest text-brand-500">{f.numero}</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">{f.titulo}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
