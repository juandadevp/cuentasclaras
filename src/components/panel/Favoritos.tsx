import Link from "next/link";
import { quitarFavoritoForm } from "@/app/panel/favoritos/actions";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { listarFavoritos } from "@/lib/favoritos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Favorito } from "@/lib/favoritos";
import { connection } from "next/server";

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" });
}

function TarjetaFavorito({ f }: { f: Favorito }) {
  const ofertas = [...f.ofertas].sort((a, b) => a.precio - b.precio);
  const minimo = ofertas[0]?.precio ?? 0;
  const maximo = ofertas[ofertas.length - 1]?.precio ?? 0;
  const consulta = new URLSearchParams({ q: f.titulo.slice(0, 80) }).toString();

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {f.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.imagen} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-lg bg-white object-contain" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-400" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h15l-1.5 8h-12z" />
              <path d="M6 7 5 3H2" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="18" cy="19" r="1.5" />
            </svg>
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm font-semibold text-foreground">{f.titulo}</p>
          <p className="mt-1 text-xs text-muted">Guardado el {fecha(f.creadoEn)}</p>
        </div>
        <form action={quitarFavoritoForm}>
          <input type="hidden" name="clave" value={f.clave} />
          <button
            type="submit"
            aria-label={`Quitar ${f.titulo} de favoritos`}
            title="Quitar de favoritos"
            className="grid size-9 place-items-center rounded-full bg-accent/30 text-amber-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
              <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
            </svg>
          </button>
        </form>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Precio al guardarlo</p>
      <p className="text-2xl font-extrabold tracking-tight text-foreground">
        {formatearMoneda(minimo)}
        {maximo > minimo && <span className="ml-2 text-sm font-semibold text-muted">hasta {formatearMoneda(maximo)}</span>}
      </p>

      <ul className="mt-3 divide-y divide-border border-t border-border">
        {ofertas.map((o, i) => (
          <li key={`${o.tienda}-${i}`} className="flex items-center gap-3 py-2.5">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{o.tienda}</p>
            <p className={`shrink-0 text-base font-extrabold ${o.precio === minimo ? "text-brand-700" : "text-foreground"}`}>{formatearMoneda(o.precio)}</p>
            {o.enlace && (
              <a
                href={o.enlace}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver en ${o.tienda}`}
                title="Ver en tienda"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-800 text-brand-50 transition-colors hover:bg-brand-700"
              >
                <span aria-hidden>↗</span>
              </a>
            )}
          </li>
        ))}
      </ul>

      <Link
        href={`/panel/recomendar?${consulta}`}
        className="mt-4 rounded-lg bg-brand-100 px-4 py-2.5 text-center text-sm font-bold text-brand-700 transition-colors hover:bg-brand-300/60"
      >
        Buscar precios actuales
      </Link>
    </li>
  );
}

export async function Favoritos() {
  await connection();
  let favoritos: Favorito[] = [];
  let falloLaConsulta = false;
  if (supabaseConfigurado()) {
    const r = await listarFavoritos(await crearClienteServidor());
    favoritos = r.favoritos;
    falloLaConsulta = Boolean(r.error);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Favoritos" subtitulo="Los productos que guardaste con la ★ en Recomendar compras." />

      {falloLaConsulta && (
        <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          No pudimos cargar tus favoritos. Si es la primera vez, ejecuta la migración <strong>favoritos</strong> en el SQL Editor de
          Supabase (carpeta <code>supabase/migrations</code>).
        </p>
      )}

      {favoritos.length === 0 ? (
        <Tarjeta>
          <div className="px-4 py-10 text-center">
            <p className="font-semibold text-foreground">Aún no tienes favoritos</p>
            <p className="mt-1 text-sm text-muted">Busca un producto y toca la ★ para guardarlo aquí.</p>
            <Link href="/panel/recomendar" className="mt-5 inline-block rounded-xl bg-brand-800 px-6 py-3 text-sm font-bold text-brand-50 transition-colors hover:bg-brand-700">
              Ir a Recomendar compras
            </Link>
          </div>
        </Tarjeta>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoritos.map((f) => (
              <TarjetaFavorito key={f.id} f={f} />
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Los precios son los que tenía cada tienda cuando guardaste el producto. Pulsa “Buscar precios actuales” para ver cuánto cuesta hoy.</p>
        </>
      )}
    </div>
  );
}
