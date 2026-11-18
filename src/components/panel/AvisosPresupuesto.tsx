import Link from "next/link";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { descripcionDeAviso, enlaceAPresupuesto, type AvisoPresupuesto } from "@/lib/avisos-presupuesto";
import { coloresCategoria, etiquetaCategoria } from "@/lib/gastos";

/** Límites del mes que están cerca de agotarse o ya se pasaron. No pinta nada si no hay avisos. */
export function AvisosPresupuesto({ avisos, mes }: { avisos: AvisoPresupuesto[]; mes: string }) {
  if (avisos.length === 0) return null;

  return (
    <Tarjeta titulo="Avisos de presupuesto" className="mt-6">
      <ul className="divide-y divide-border">
        {avisos.map((aviso) => (
          <li key={aviso.categoria} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: coloresCategoria[aviso.categoria] }} />
            <p className="min-w-0 flex-1 text-sm text-foreground">{descripcionDeAviso(aviso)}</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                aviso.estado === "excedido" ? "bg-rose-50 text-rose-700" : "bg-accent/20 text-brand-800"
              }`}
            >
              {aviso.estado === "excedido" ? "Excedido" : "Cerca del límite"}
            </span>
            <Link
              href={enlaceAPresupuesto(mes, aviso.categoria)}
              aria-label={`Ver en Presupuesto: ${etiquetaCategoria(aviso.categoria)}`}
              className="text-sm font-semibold text-brand-700 hover:underline">
              Ver en Presupuesto
            </Link>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
