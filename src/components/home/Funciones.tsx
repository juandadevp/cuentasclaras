import type { ReactNode } from "react";

const funciones: { titulo: string; texto: string; icono: ReactNode }[] = [
  {
    titulo: "Registro rápido",
    texto: "Anota un gasto en menos de 5 segundos desde el celular o el computador.",
    icono: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    titulo: "Gráficos y reportes",
    texto: "Visualiza por categoría y compara mes a mes para detectar fugas de dinero.",
    icono: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 16v-5M12 16V8M17 16v-8" />
      </>
    ),
  },
  {
    titulo: "Presupuestos y alertas",
    texto: "Define un límite mensual y recibe un aviso antes de pasarte.",
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
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

        <ul className="mt-10 grid gap-6 text-left md:grid-cols-3">
          {funciones.map((f) => (
            <li key={f.titulo} className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
              <span className="mb-4 grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {f.icono}
                </svg>
              </span>
              <h3 className="text-lg font-bold text-foreground">{f.titulo}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
