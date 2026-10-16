import type { ReactNode } from "react";

/* Vistas previas ilustrativas (los datos son de ejemplo). */

function VistaRegistro() {
  return (
    <div className="w-60 rounded-xl bg-white p-3.5 shadow-md ring-1 ring-black/5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Nuevo gasto</p>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-xs">
        <span className="text-foreground">Supermercado</span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Comida</span>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5">
        <span className="text-sm font-bold text-foreground">$ 186.000</span>
        <span className="text-[10px] text-muted">Hoy</span>
      </div>
      <div className="mt-2.5 rounded-lg bg-brand-800 py-1.5 text-center text-xs font-semibold text-brand-50">
        + Guardar gasto
      </div>
    </div>
  );
}

function VistaGrafico() {
  const meses = [
    { mes: "May", valor: 45 },
    { mes: "Jun", valor: 62 },
    { mes: "Jul", valor: 38 },
    { mes: "Ago", valor: 70 },
    { mes: "Sep", valor: 55 },
    { mes: "Oct", valor: 42 },
  ];
  return (
    <div className="w-60 rounded-xl bg-white p-3.5 shadow-md ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Gasto por mes</p>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">▼ 24%</span>
      </div>
      <div className="mt-3 flex h-20 items-end gap-2">
        {meses.map((m, i) => (
          <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md ${i === meses.length - 1 ? "bg-brand-800" : "bg-brand-300"}`}
              style={{ height: `${m.valor}px` }}
            />
            <span className="text-[9px] text-muted">{m.mes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaPresupuesto() {
  return (
    <div className="w-60 rounded-xl bg-white p-3.5 shadow-md ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Presupuesto</p>
        <span className="text-xs font-bold text-foreground">$ 2.500.000</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-brand-500 to-brand-800" />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted">
        <span>Gastado $ 2.050.000</span>
        <span className="font-semibold text-foreground">82%</span>
      </div>
      <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-accent/25 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900">
        <span aria-hidden>🔔</span> Estás cerca de tu límite
      </div>
    </div>
  );
}

const funciones: { numero: string; titulo: string; texto: string; vista: ReactNode }[] = [
  {
    numero: "01",
    titulo: "Registro rápido",
    texto: "Anota un gasto en menos de 5 segundos desde el celular o el computador.",
    vista: <VistaRegistro />,
  },
  {
    numero: "02",
    titulo: "Gráficos y reportes",
    texto: "Visualiza por categoría y compara mes a mes para detectar fugas de dinero.",
    vista: <VistaGrafico />,
  },
  {
    numero: "03",
    titulo: "Presupuestos y alertas",
    texto: "Define un límite mensual y recibe un aviso antes de pasarte.",
    vista: <VistaPresupuesto />,
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
                className="flex h-52 items-center justify-center bg-menta transition-transform duration-300 group-hover:scale-[1.02]"
              >
                {f.vista}
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
