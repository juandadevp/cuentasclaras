import { formatearMoneda } from "@/lib/format";
import { mesCorto } from "@/lib/gastos";

interface Props {
  meses: { mes: string; total: number }[];
  /** Mes resaltado (yyyy-mm). */
  actual: string;
}

/** Barras con el total gastado en cada mes. Si todos los meses están en 0 muestra un mensaje. */
export function BarrasMeses({ meses, actual }: Props) {
  const maximo = Math.max(...meses.map((m) => m.total), 0);

  if (maximo === 0) {
    return (
      <div className="grid min-h-48 place-items-center text-center text-sm text-muted">
        <p>Cuando registres gastos verás aquí cómo se mueve tu dinero mes a mes.</p>
      </div>
    );
  }

  return (
    <div role="img" aria-label={`Gasto de los últimos meses: ${meses.map((m) => `${mesCorto(m.mes)} ${formatearMoneda(m.total)}`).join(", ")}`}>
      <div className="flex h-48 items-end gap-2 border-b border-border px-1 pt-6 sm:gap-3">
        {meses.map(({ mes, total }) => {
          const alto = total > 0 ? Math.max((total / maximo) * 100, 3) : 0;
          return (
            <div key={mes} className="group flex h-full min-w-0 flex-1 flex-col justify-end" title={`${mesCorto(mes)}: ${formatearMoneda(total)}`}>
              <span className="mb-1 truncate text-center text-[11px] font-bold text-muted opacity-0 transition-opacity group-hover:opacity-100">
                {total > 0 ? formatearMoneda(total) : ""}
              </span>
              <div
                className={`w-full rounded-t-lg transition-colors ${mes === actual ? "bg-brand-800" : "bg-brand-300 group-hover:bg-brand-500"}`}
                style={{ height: `${alto}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 px-1 sm:gap-3" aria-hidden>
        {meses.map(({ mes }) => (
          <span key={mes} className={`min-w-0 flex-1 text-center text-xs ${mes === actual ? "font-bold text-foreground" : "text-muted"}`}>
            {mesCorto(mes)}
          </span>
        ))}
      </div>
    </div>
  );
}
