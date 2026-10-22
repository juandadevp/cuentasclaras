import type { ReactNode } from "react";

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const funciones: { numero: string; titulo: string; texto: string; icono: ReactNode }[] = [
  {
    numero: "01",
    titulo: "Registro rápido",
    texto: "Anota un gasto en menos de 5 segundos desde el celular o el computador.",
    icono: (
      <Icono>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </Icono>
    ),
  },
  {
    numero: "02",
    titulo: "Gráficos y reportes",
    texto: "Visualiza por categoría y compara mes a mes para detectar fugas de dinero.",
    icono: (
      <Icono>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </Icono>
    ),
  },
  {
    numero: "03",
    titulo: "Ahorro y consejos con IA",
    texto: "Mira cuánto ahorras cada mes y recibe recomendaciones para gastar mejor.",
    icono: (
      <Icono>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </Icono>
    ),
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
              <div
                aria-hidden
                className="flex h-44 items-center justify-center bg-menta text-brand-800 transition-transform duration-300 group-hover:scale-[1.02]"
              >
                <span className="grid size-24 place-items-center rounded-3xl bg-white shadow-md ring-1 ring-black/5">{f.icono}</span>
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
