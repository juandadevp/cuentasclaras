import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TarjetaFavorito } from "@/components/panel/TarjetaFavorito";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { mensajeDeErrorFavoritos, type Favorito } from "@/lib/favoritos";
import { listarFavoritos } from "@/lib/favoritos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Pantalla «Favoritos»: los productos que la persona guardó con la estrella. */
export async function Favoritos() {
  // Siempre dinámico: depende de la sesión (los favoritos son de cada persona).
  await connection();
  let favoritos: Favorito[] = [];
  let aviso: string | undefined;

  if (supabaseConfigurado()) {
    const r = await listarFavoritos(await crearClienteServidor());
    favoritos = r.favoritos;
    if (r.error) aviso = mensajeDeErrorFavoritos(r.error);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Favoritos" subtitulo="Los productos que guardaste con la ★ en Recomendar compras." />

      {aviso ? <AvisoPanel>{aviso}</AvisoPanel> : null}

      {favoritos.length === 0 ? (
        <Tarjeta>
          <div className="px-4 py-10 text-center">
            <p className="font-semibold text-foreground">Aún no tienes favoritos</p>
            <p className="mt-1 text-sm text-muted">Busca un producto y toca la ★ para guardarlo aquí.</p>
            <Link
              href="/panel/recomendar"
              className="mt-5 inline-block rounded-xl bg-brand-800 px-6 py-3 text-sm font-bold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >
              Ir a Recomendar compras
            </Link>
          </div>
        </Tarjeta>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoritos.map((f) => (
              <TarjetaFavorito key={f.id} favorito={f} />
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Los precios son los que tenía cada tienda cuando guardaste el producto. Pulsa “Buscar precios actuales” para ver cuánto cuesta hoy.
          </p>
        </>
      )}
    </div>
  );
}
