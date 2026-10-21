import Link from "next/link";
import { connection } from "next/server";
import { AsesorIA } from "@/components/panel/AsesorIA";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { cargarResumenAhorro } from "@/app/panel/ahorro/datos";
import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria, nombreDelMes } from "@/lib/gastos";

/** Cuánto se ahorró (o gastó de más) cada mes y consejos de la IA. */
export async function Ahorro() {
  await connection();
  const { resumen, error } = await cargarResumenAhorro();
  const primero = resumen.filas.findIndex((f) => f.total > 0);
  const filas = (primero === -1 ? [] : resumen.filas.slice(primero)).reverse();
  const hayDatos = resumen.filas.some((f) => f.total > 0);
  const mejoran = resumen.categorias.filter((c) => c.anterior > c.actual).sort((a, b) => b.anterior - b.actual - (a.anterior - a.actual));

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Mi ahorro" subtitulo="Compara cada mes con el anterior y recibe consejos para gastar mejor." />

      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          No pudimos cargar tus gastos. Revisa que las migraciones de Supabase estén ejecutadas.
        </p>
      )}

      <Tarjeta titulo="Consejos con IA" className="mb-6">
        {hayDatos ? (
          <AsesorIA />
        ) : (
          <p className="text-sm text-muted">
            Aún no hay gastos para analizar.{" "}
            <Link href="/panel/registrar" className="font-bold text-brand-700 hover:underline">
              Registra el primero
            </Link>
            .
          </p>
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Ahorro mes a mes">
          <ul className="divide-y divide-border">
            {filas.map((f) => (
              <li key={f.mes} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="font-semibold text-foreground">
                    {nombreDelMes(f.mes)} {f.enCurso && <span className="ml-1 rounded-full bg-accent/30 px-2 py-0.5 text-xs font-bold text-amber-900">en curso</span>}
                  </p>
                  <p className="text-sm text-muted">Gastaste {formatearMoneda(f.total)}</p>
                </div>
                <div className="text-right text-sm font-bold">
                  {f.ahorro === null ? (
                    <span className="font-medium text-muted">Sin mes anterior para comparar</span>
                  ) : f.ahorro >= 0 ? (
                    <span className="text-brand-700">▼ Ahorraste {formatearMoneda(f.ahorro)}</span>
                  ) : (
                    <span className="text-rose-600">▲ {formatearMoneda(-f.ahorro)} más</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">«Ahorro» = lo que gastaste de menos frente al mes anterior. El mes en curso aún está incompleto.</p>
        </Tarjeta>

        <Tarjeta titulo="Categorías: este mes vs. el anterior">
          {resumen.categorias.length === 0 ? (
            <p className="text-sm text-muted">Sin gastos este mes ni el anterior.</p>
          ) : (
            <ul className="divide-y divide-border">
              {[...resumen.categorias]
                .sort((a, b) => b.actual - a.actual)
                .map((c) => (
                  <li key={c.categoria} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                    <span className="font-semibold text-foreground">{etiquetaCategoria(c.categoria)}</span>
                    <span className="text-right text-muted">
                      <strong className="text-foreground">{formatearMoneda(c.actual)}</strong> · antes {formatearMoneda(c.anterior)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          {mejoran.length > 0 && (
            <p className="mt-3 text-xs text-muted">Vas gastando menos en {mejoran.map((c) => etiquetaCategoria(c.categoria)).join(", ")}.</p>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
