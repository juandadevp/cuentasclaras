import { formatearMoneda } from "@/lib/format";
import { coloresCategoria, etiquetaCategoria } from "@/lib/gastos";
import type { Categoria } from "@/types/gasto";

interface Props {
  datos: { categoria: Categoria; total: number }[];
  total: number;
}

/** Gráfico de dona con el gasto por categoría y su leyenda. Si no hay gastos muestra un mensaje. */
export function DonaCategorias({ datos, total }: Props) {
  if (datos.length === 0 || total <= 0) {
    return (
      <div className="grid min-h-48 place-items-center text-center text-sm text-muted">
        <p>Cuando registres gastos verás aquí en qué se va tu dinero.</p>
      </div>
    );
  }

  // Posición inicial de cada segmento = suma de los porcentajes anteriores.
  const segmentos = datos.reduce<{ categoria: Categoria; total: number; pct: number; inicio: number }[]>((lista, d) => {
    const inicio = lista.length ? lista[lista.length - 1].inicio + lista[lista.length - 1].pct : 0;
    return [...lista, { ...d, pct: (d.total / total) * 100, inicio }];
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90" role="img" aria-label="Gasto por categoría">
          <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#dcf5e5" strokeWidth="6" />
          {segmentos.map(({ categoria, total: valor, pct, inicio }) => (
            <circle
              key={categoria}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={coloresCategoria[categoria]}
              strokeWidth="6"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-inicio}
            >
              <title>{`${etiquetaCategoria(categoria)}: ${formatearMoneda(valor)}`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="text-xs font-semibold text-muted">Gastado</span>
          <span className="text-lg font-extrabold leading-tight text-foreground">{formatearMoneda(total)}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5 text-sm">
        {datos.map(({ categoria, total: valor }) => (
          <li key={categoria} className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: coloresCategoria[categoria] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{etiquetaCategoria(categoria)}</span>
            <span className="text-muted">{formatearMoneda(valor)}</span>
            <span className="w-10 text-right font-bold text-foreground">{Math.round((valor / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
