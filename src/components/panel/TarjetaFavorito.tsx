import Link from "next/link";
import { BotonQuitarFavorito } from "@/components/panel/BotonQuitarFavorito";
import { ImagenProducto } from "@/components/panel/ImagenProducto";
import { enlaceBuscarPrecios, resumirOfertas, type Favorito } from "@/lib/favoritos";
import { formatearMoneda } from "@/lib/format";

/** Fecha corta para mostrar (solo presentación; en zona horaria de Colombia). */
function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" });
}

/** Un producto guardado, con los precios que tenía en cada tienda cuando se guardó. */
export function TarjetaFavorito({ favorito }: { favorito: Favorito }) {
  const { ordenadas, minimo, maximo } = resumirOfertas(favorito.ofertas);

  return (
    <li className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-4">
        <ImagenProducto src={favorito.imagen} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 break-words text-sm font-semibold text-foreground">{favorito.titulo}</p>
          <p className="mt-1 text-xs text-muted">Guardado el {fechaCorta(favorito.fecha)}</p>
        </div>
        <BotonQuitarFavorito clave={favorito.clave} titulo={favorito.titulo} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Precio al guardarlo</p>
      <p className="text-2xl font-extrabold tracking-tight text-foreground">
        {formatearMoneda(minimo)}
        {maximo > minimo ? <span className="ml-2 text-sm font-semibold text-muted">hasta {formatearMoneda(maximo)}</span> : null}
      </p>

      <ul className="mt-3 divide-y divide-border border-t border-border">
        {ordenadas.map((o, i) => (
          <li key={`${o.tienda}-${i}`} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{o.tienda}</p>
              {o.detalle ? <p className="truncate text-xs text-muted">{o.detalle}</p> : null}
            </div>
            <p className={`shrink-0 text-base font-extrabold ${o.precio === minimo ? "text-brand-700" : "text-foreground"}`}>{formatearMoneda(o.precio)}</p>
            {o.enlace ? (
              <a
                href={o.enlace}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver en ${o.tienda}`}
                title="Ver en tienda"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-800 text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              >
                <span aria-hidden>↗</span>
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <Link
        href={enlaceBuscarPrecios(favorito)}
        className="mt-4 rounded-lg bg-brand-100 px-4 py-2.5 text-center text-sm font-bold text-brand-700 transition-colors hover:bg-brand-300/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      >
        Buscar precios actuales
      </Link>
    </li>
  );
}
