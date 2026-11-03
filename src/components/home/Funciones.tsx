import Image from "next/image";
import type { ReactNode } from "react";

// Ilustración propia: barras de progreso por categoría (aún no hay captura del módulo de presupuestos).
const ilustracionPresupuestos = (
  <div role="img" aria-label="Barras de avance del presupuesto por categoría" className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5 shadow-md ring-1 ring-black/5">
    {[
      { nombre: "Alimentación", avance: "w-3/4", color: "bg-brand-500" },
      { nombre: "Transporte", avance: "w-1/2", color: "bg-accent" },
      { nombre: "Ocio", avance: "w-1/4", color: "bg-manzana" },
    ].map((c) => (
      <div key={c.nombre}>
        <p className="text-xs font-semibold text-foreground">{c.nombre}</p>
        <div className="mt-1 h-2.5 rounded-full bg-brand-100">
          <div className={`h-full rounded-full ${c.avance} ${c.color}`} />
        </div>
      </div>
    ))}
  </div>
);

interface Funcion {
  numero: string;
  titulo: string;
  texto: string;
  imagen: ReactNode;
}

const claseCaptura =
  "max-h-full w-auto max-w-full rounded-xl object-contain shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-[1.03]";
const tamanos = "(min-width: 768px) 33vw, 100vw";

const funciones: Funcion[] = [
  {
    numero: "01",
    titulo: "Registro rápido",
    texto: "Anota un gasto en menos de 5 segundos desde el celular o el computador.",
    imagen: (
      <Image src="/funciones/registro-recorte.png" alt="Pantalla para registrar un gasto" width={808} height={456} sizes={tamanos} className={claseCaptura} />
    ),
  },
  {
    numero: "02",
    titulo: "Gráficos y reportes",
    texto: "Visualiza por categoría y compara mes a mes para detectar fugas de dinero.",
    imagen: (
      <Image src="/funciones/graficos-recorte.png" alt="Gráficos de gastos por categoría y por mes" width={568} height={582} sizes={tamanos} className={claseCaptura} />
    ),
  },
  {
    numero: "03",
    titulo: "Presupuestos por categoría",
    texto: "Define cuánto quieres gastar en cada categoría y mira cuánto te queda en el mes.",
    imagen: ilustracionPresupuestos,
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
            <li key={f.titulo} className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex h-64 items-center justify-center bg-menta p-4">{f.imagen}</div>
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
