import Link from "next/link";
import { ConfirmarEliminar } from "@/components/panel/ConfirmarEliminar";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { coloresCategoria, etiquetaCategoria } from "@/lib/gastos";
import type { Gasto } from "@/types/gasto";

interface Props {
  gastos: Gasto[];
  vacio?: string;
}

const iconoEditar = (
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </>
);

/** Tabla de gastos con acciones de editar y eliminar. */
export function TablaGastos({ gastos, vacio }: Props) {
  if (gastos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="font-semibold text-foreground">Aún no hay gastos</p>
        <p className="mt-1 text-sm text-muted">{vacio ?? "Cuando registres uno aparecerá aquí."}</p>
      </div>
    );
  }

  return (
    <div className="relative -mx-2 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-bold uppercase tracking-wide text-muted">
            <th className="px-3 py-3">Fecha</th>
            <th className="px-3 py-3">Concepto</th>
            <th className="px-3 py-3">Categoría</th>
            <th className="px-3 py-3 text-right">Importe</th>
            <th className="px-3 py-3 text-right">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {gastos.map((g) => (
            <tr key={g.id} className="transition-colors hover:bg-neutral-50">
              <td className="whitespace-nowrap px-3 py-3.5 text-muted">{formatearFecha(g.fecha)}</td>
              <td className="px-3 py-3.5">
                <span className="font-semibold text-foreground">{g.descripcion}</span>
                {g.tienda ? <span className="block text-xs text-muted">en {g.tienda}</span> : null}
              </td>
              <td className="px-3 py-3.5">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: coloresCategoria[g.categoria] }} aria-hidden />
                  {etiquetaCategoria(g.categoria)}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-3.5 text-right font-bold text-foreground">{formatearMoneda(g.monto)}</td>
              <td className="px-3 py-2.5">
                <div className="flex justify-end gap-1.5">
                  <Link
                    href={`/panel/gastos/${g.id}/editar`}
                    aria-label={`Editar ${g.descripcion}`}
                    title="Editar"
                    className="grid size-9 place-items-center rounded-lg bg-accent/25 text-brand-800 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {iconoEditar}
                    </svg>
                  </Link>
                  <ConfirmarEliminar id={g.id} descripcion={g.descripcion} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
