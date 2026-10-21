import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { coloresCategoria, etiquetaCategoria } from "@/lib/gastos";
import { totalGastos } from "@/lib/utils";
import type { Categoria, Gasto } from "@/types/gasto";

interface Props {
  gastos: Gasto[];
  total: number;
  vacio: string;
}

/** Gastos separados por sección: solo aparecen las categorías en las que hay compras. */
export function GastosPorCategoria({ gastos, total, vacio }: Props) {
  if (gastos.length === 0) {
    return (
      <Tarjeta titulo="0 gastos">
        <TablaGastos gastos={[]} vacio={vacio} />
      </Tarjeta>
    );
  }

  const grupos = new Map<Categoria, Gasto[]>();
  for (const g of gastos) grupos.set(g.categoria, [...(grupos.get(g.categoria) ?? []), g]);
  const secciones = [...grupos.entries()]
    .map(([categoria, lista]) => ({ categoria, lista, subtotal: totalGastos(lista) }))
    .sort((a, b) => b.subtotal - a.subtotal);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {gastos.length} {gastos.length === 1 ? "gasto" : "gastos"} en {secciones.length}{" "}
        {secciones.length === 1 ? "categoría" : "categorías"} · Total:{" "}
        <strong className="text-lg text-foreground">{formatearMoneda(total)}</strong>
      </p>
      {secciones.map(({ categoria, lista, subtotal }) => (
        <Tarjeta
          key={categoria}
          titulo={
            <span className="inline-flex items-center gap-2.5">
              <span className="size-3 rounded-full" style={{ backgroundColor: coloresCategoria[categoria] }} aria-hidden />
              {etiquetaCategoria(categoria)}
            </span>
          }
          acciones={
            <p className="text-sm text-muted">
              {lista.length} {lista.length === 1 ? "gasto" : "gastos"} ·{" "}
              <strong className="text-lg text-foreground">{formatearMoneda(subtotal)}</strong>
            </p>
          }
        >
          <TablaGastos gastos={lista} />
        </Tarjeta>
      ))}
    </div>
  );
}
