import { eliminarGasto } from "@/app/panel/actions";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { etiquetaCategoria } from "@/lib/gastos";
import type { Gasto } from "@/types/gasto";

export function ListaGastos({ gastos }: { gastos: Gasto[] }) {
  if (gastos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="font-semibold text-foreground">Aún no hay gastos en este mes</p>
        <p className="mt-1 text-sm text-muted">Agrega el primero con el formulario y aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {gastos.map((g) => (
        <li key={g.id} className="flex items-center gap-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{g.descripcion}</p>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-muted">
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {etiquetaCategoria(g.categoria)}
              </span>
              {formatearFecha(g.fecha)}
            </p>
          </div>
          <p className="shrink-0 font-bold text-foreground">{formatearMoneda(g.monto)}</p>
          <form action={eliminarGasto}>
            <input type="hidden" name="id" value={g.id} />
            <button
              type="submit"
              aria-label={`Eliminar ${g.descripcion}`}
              title="Eliminar"
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
              </svg>
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
