import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { guardarFavorito, quitarFavorito } from "@/app/panel/favoritos/actions";
import { buscarPrecios } from "@/app/panel/recomendar/actions";
import { RecomendarCompras } from "@/components/panel/RecomendarCompras";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { leerBusquedaInicial, mensajeDeErrorFavoritos } from "@/lib/favoritos";
import { clavesFavoritas } from "@/lib/favoritos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Recomendar compras" };

async function ConFavoritos({ searchParams }: { searchParams: PageProps<"/panel/recomendar">["searchParams"] }) {
  // Siempre dinámico: las estrellas dependen de la sesión (los favoritos son de cada persona).
  await connection();
  // Texto y tipo con los que puede llegar la pantalla (desde Favoritos): vienen de la barra de direcciones, se limpian.
  const { consulta, tipo } = leerBusquedaInicial(await searchParams);

  let favoritos: string[] = [];
  let aviso: string | undefined;
  if (supabaseConfigurado()) {
    const r = await clavesFavoritas(await crearClienteServidor());
    favoritos = r.claves;
    if (r.error) aviso = mensajeDeErrorFavoritos(r.error);
  }

  return (
    <RecomendarCompras
      // La key reinicia el buscador cuando se llega con otro producto (por ejemplo, desde Favoritos).
      key={`${consulta}|${tipo}`}
      buscar={buscarPrecios}
      guardar={guardarFavorito}
      quitar={quitarFavorito}
      favoritosIniciales={favoritos}
      avisoFavoritos={aviso}
      consultaInicial={consulta}
      tipoInicial={tipo}
    />
  );
}

export default function RecomendarPage(props: PageProps<"/panel/recomendar">) {
  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Recomendar compras" subtitulo="Busca un producto y compara sus precios en las tiendas." />
      <Suspense fallback={<div aria-busy className="h-96" />}>
        <ConFavoritos searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
