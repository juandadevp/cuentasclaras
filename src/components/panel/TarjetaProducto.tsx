import Link from "next/link";
import { formatearMoneda } from "@/lib/format";
import type { Producto } from "@/lib/precios/agrupar";
import { enlaceBusquedaTienda, enlaceRegistrar } from "@/lib/precios/compra";
import type { Rubro } from "@/lib/precios/rubros";
import type { Oferta } from "@/lib/precios/tipos";
import { dividirTiendas, TIENDAS_VISIBLES } from "@/lib/precios/vista";

const iconoCarrito = (
  <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h15l-1.5 8h-12z" />
    <path d="M6 7 5 3H2" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="18" cy="19" r="1.5" />
  </svg>
);

interface PropsFila {
  oferta: Oferta;
  buscado: string;
  rubro: Rubro | null | undefined;
  imagen?: string;
  mejor: boolean;
  ajena: boolean;
}

function FilaTienda({ oferta, buscado, rubro, imagen, mejor, ajena }: PropsFila) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
          {oferta.tienda}
          {ajena ? <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[11px] font-bold text-brand-800">Otro tipo de tienda</span> : null}
        </p>
        {oferta.detalle ? <p className="truncate text-xs text-muted">{oferta.detalle}</p> : null}
      </div>
      <p className={`shrink-0 text-base font-extrabold ${mejor ? "text-brand-700" : "text-foreground"}`}>{formatearMoneda(oferta.precio)}</p>
      <a
        href={oferta.enlace ?? enlaceBusquedaTienda(oferta, buscado)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={oferta.enlace ? `Ver en ${oferta.tienda}` : `Buscar en ${oferta.tienda}`}
        title={oferta.enlace ? "Ver en tienda" : "Buscar en la tienda"}
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-800 text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      >
        <span aria-hidden>↗</span>
      </a>
      <Link
        href={enlaceRegistrar(oferta, rubro, imagen)}
        aria-label={`Registrar gasto de ${formatearMoneda(oferta.precio)} en ${oferta.tienda}`}
        title="Registrar como gasto"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/25 text-base font-bold text-brand-800 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      >
        <span aria-hidden>+</span>
      </Link>
    </li>
  );
}

interface Props {
  producto: Producto;
  /** La oferta más barata de toda la búsqueda: su tarjeta lleva «Mejor precio». */
  barata: Oferta | undefined;
  buscado: string;
  rubro: Rubro | null | undefined;
  /** true cuando se están viendo tiendas que no son del tipo de producto: se marcan. */
  marcarAjenas: boolean;
}

/** Un producto, con su precio «desde» y el precio en cada tienda (hasta 3 a la vista y el resto en un desplegable). */
export function TarjetaProducto({ producto, barata, buscado, rubro, marcarAjenas }: Props) {
  const { primeras, otras } = dividirTiendas(producto.ofertas);
  const esMejor = barata ? producto.ofertas.includes(barata) : false;
  const fila = (o: Oferta, i: number) => (
    <FilaTienda
      key={`${o.tienda}-${i}`}
      oferta={o}
      buscado={buscado}
      rubro={rubro}
      imagen={producto.imagen}
      mejor={o.precio === producto.minimo}
      ajena={marcarAjenas && o.relevante === false}
    />
  );

  return (
    <li className={`flex min-w-0 flex-col rounded-2xl border bg-surface p-5 shadow-sm ${esMejor ? "border-brand-500 ring-2 ring-brand-500/20" : "border-border"}`}>
      <div className="flex items-start gap-4">
        {producto.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-lg bg-white object-contain" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-400" aria-hidden>
            {iconoCarrito}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {esMejor ? <span className="mb-1.5 inline-block rounded-full bg-brand-800 px-2.5 py-0.5 text-xs font-bold text-white">Mejor precio</span> : null}
          <p className="line-clamp-3 break-words text-sm font-semibold text-foreground">{producto.titulo}</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Desde</p>
      <p className="text-2xl font-extrabold tracking-tight text-foreground">
        {formatearMoneda(producto.minimo)}
        {producto.maximo > producto.minimo ? <span className="ml-2 text-sm font-semibold text-muted">hasta {formatearMoneda(producto.maximo)}</span> : null}
      </p>
      <p className="text-xs text-muted">
        en {producto.ofertas.length} {producto.ofertas.length === 1 ? "tienda" : "tiendas"}
      </p>

      <ul className="mt-3 divide-y divide-border border-t border-border">{primeras.map(fila)}</ul>
      {otras.length > 0 ? (
        <details className="group border-t border-border">
          <summary className="cursor-pointer list-none py-2.5 text-sm font-bold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
            <span className="group-open:hidden">
              Ver las otras {otras.length} {otras.length === 1 ? "tienda" : "tiendas"}
            </span>
            <span className="hidden group-open:inline">Ocultar</span>
          </summary>
          <ul className="divide-y divide-border">{otras.map((o, i) => fila(o, i + TIENDAS_VISIBLES))}</ul>
        </details>
      ) : null}
    </li>
  );
}
