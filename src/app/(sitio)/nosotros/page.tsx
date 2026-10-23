import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nosotros" };

const integrantes = ["Juan David Plata Polania", "Jorge Alejandro Arias Vargas", "Cristian Alirio Ruiz Sarmiento"];

export default function NosotrosPage() {
  return (
    <section className="bg-neutral-50 px-6 py-16 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Nosotros</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Cuentas Claras es una aplicación web para llevar el control de los gastos mensuales: registrar lo que gastas, verlo por categoría, comparar tus meses,
          buscar mejores precios y recibir consejos de ahorro.
        </p>
        <h2 className="mt-10 text-xl font-bold text-foreground">Integrantes</h2>
        <ul className="mt-3 space-y-2">
          {integrantes.map((n) => (
            <li key={n} className="rounded-xl border border-border bg-surface px-5 py-3 font-semibold text-foreground">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
