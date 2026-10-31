import type { ReactNode } from "react";

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const items = [
  {
    titulo: "Compara precios antes de comprar",
    texto: "Busca un producto y mira su precio en las tiendas de Colombia. Elige la mejor opción y regístrala con un clic, ya categorizada.",
    icono: (
      <Icono>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </Icono>
    ),
  },
  {
    titulo: "Mira cuánto ahorras cada mes",
    texto: "Compara cada mes con el anterior y descubre en qué categorías gastas de más o de menos.",
    icono: (
      <Icono>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </Icono>
    ),
  },
  {
    titulo: "Tus datos son solo tuyos",
    texto: "Cada cuenta tiene su propio espacio protegido. Nadie más puede ver tus gastos ni tus favoritos.",
    icono: (
      <Icono>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </Icono>
    ),
  },
];

export function Diferenciales() {
  return (
    <section className="bg-neutral-800 px-6 py-20 text-white lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-300">Por qué Cuentas Claras</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Más que anotar gastos</h2>
          <p className="mt-3 text-lg text-neutral-300">Te ayuda a decidir mejor antes de gastar y a entender qué pasó después.</p>
        </div>
        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <li key={i.titulo} className="rounded-2xl border border-white/10 bg-white/5 p-7 transition-colors hover:bg-white/10">
              <span className="grid size-14 place-items-center rounded-2xl bg-menta text-brand-800">{i.icono}</span>
              <h3 className="mt-5 text-xl font-bold">{i.titulo}</h3>
              <p className="mt-2 leading-relaxed text-neutral-300">{i.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
