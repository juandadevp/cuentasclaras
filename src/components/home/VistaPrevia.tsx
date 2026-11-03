import { BarrasMeses } from "@/components/panel/BarrasMeses";
import { DonaCategorias } from "@/components/panel/DonaCategorias";
import { formatearMoneda } from "@/lib/format";

/* Datos de ejemplo, solo para mostrar cómo se ve el portal. No son datos de nadie. */
const categoriasEjemplo = [
  { categoria: "alimentacion" as const, total: 820000 },
  { categoria: "vivienda" as const, total: 640000 },
  { categoria: "transporte" as const, total: 310000 },
  { categoria: "tecnologia" as const, total: 240000 },
  { categoria: "ocio" as const, total: 150000 },
];
const totalEjemplo = categoriasEjemplo.reduce((suma, c) => suma + c.total, 0);
const MES_ACTUAL = "2026-10";
const mesesEjemplo = [
  { mes: "2026-05", total: 2150000 },
  { mes: "2026-06", total: 2480000 },
  { mes: "2026-07", total: 2300000 },
  { mes: "2026-08", total: 2620000 },
  { mes: "2026-09", total: 2410000 },
  { mes: MES_ACTUAL, total: totalEjemplo },
];

export function VistaPrevia() {
  return (
    <section className="bg-menta px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Así se ve tu mes</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-800 sm:text-4xl">Todo claro de un vistazo</h2>
          <p className="mt-3 text-lg text-brand-800/75">Un ejemplo con datos de muestra de cómo verás tus cuentas en tu portal.</p>
        </div>

        <div className="mt-12 rounded-3xl bg-white p-4 shadow-xl shadow-black/10 ring-1 ring-black/5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-2 pb-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-muted">
                Total del mes
                <span className="rounded-full bg-menta px-2.5 py-0.5 text-xs font-bold text-brand-800">Datos de ejemplo</span>
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-foreground">{formatearMoneda(totalEjemplo)}</p>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1.5 text-sm font-bold text-brand-700">▼ Gastaste menos que el mes pasado</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border p-4 sm:p-5">
              <h3 className="mb-4 font-bold text-foreground">Gastos por categoría</h3>
              <DonaCategorias datos={categoriasEjemplo} total={totalEjemplo} />
            </div>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border p-4 sm:p-5">
              <h3 className="mb-4 font-bold text-foreground">Últimos 6 meses</h3>
              <BarrasMeses meses={mesesEjemplo} actual={MES_ACTUAL} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-brand-800/70">Datos de ejemplo: no corresponden a ninguna persona real.</p>
      </div>
    </section>
  );
}
