import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria } from "@/lib/gastos";
import type { Categoria } from "@/types/gasto";

const colores: Record<Categoria, string> = {
  vivienda: "#153519",
  alimentacion: "#266a37",
  transporte: "#3f9a58",
  servicios: "#8fd3a5",
  ocio: "#f2b84b",
  salud: "#6b7280",
  otros: "#c4c9cf",
};

export function GastosPorCategoria({ datos, total }: { datos: { categoria: Categoria; total: number }[]; total: number }) {
  if (datos.length === 0) return <p className="text-sm text-muted">Cuando registres gastos verás aquí en qué se va tu dinero.</p>;

  return (
    <ul className="space-y-4">
      {datos.map(({ categoria, total: valor }) => {
        const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
        return (
          <li key={categoria}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-foreground">{etiquetaCategoria(categoria)}</span>
              <span className="text-muted">
                {formatearMoneda(valor)} · <strong className="text-foreground">{pct}%</strong>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: colores[categoria] }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
