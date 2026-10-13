import type { Gasto } from "@/types/gasto";
import { formatearFecha, formatearMoneda } from "@/lib/format";

export function ListaGastos({ gastos }: { gastos: Gasto[] }) {
  if (gastos.length === 0) {
    return <p className="text-sm text-zinc-500">Aún no hay gastos registrados.</p>;
  }
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {gastos.map((g) => (
        <li key={g.id} className="flex justify-between py-2 text-sm">
          <span>
            {g.descripcion} <span className="text-zinc-500">· {formatearFecha(g.fecha)}</span>
          </span>
          <span className="font-medium">{formatearMoneda(g.monto)}</span>
        </li>
      ))}
    </ul>
  );
}
