import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { formatearMoneda } from "@/lib/format";
import { agruparPorCategoria, coloresCategoria, etiquetaCategoria } from "@/lib/gastos";
import type { Gasto } from "@/types/gasto";

interface Props {
  gastos: Gasto[];
  total: number;
  vacio: string;
}

/** Gastos separados por sección: solo aparecen las categorías en las que hay compras, cada una con su subtotal. */
export function GastosPorCategoria({ gastos, total, vacio }: Props) {
  if (gastos.length === 0) {
    return (
      <Tarjeta titulo="0 gastos">
        <TablaGastos gastos={[]} vacio={vacio} />
      </Tarjeta>
    );
  }

  const secciones = agruparPorCategoria(gastos);

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
