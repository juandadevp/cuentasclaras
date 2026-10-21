import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { RecomendarCompras } from "@/components/panel/RecomendarCompras";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { clavesFavoritas } from "@/lib/favoritos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Recomendar compras" };

async function ConFavoritos({ searchParams }: { searchParams: PageProps<"/panel/recomendar">["searchParams"] }) {
  // Siempre dinámico: depende de la sesión (los favoritos son de cada usuario).
  await connection();
  const { q } = await searchParams;
  let favoritos: string[] = [];
  if (supabaseConfigurado()) favoritos = await clavesFavoritas(await crearClienteServidor());
  const consultaInicial = typeof q === "string" ? q.replace(/\s+/g, " ").trim().slice(0, 80) : "";
  return <RecomendarCompras key={consultaInicial} favoritosIniciales={favoritos} consultaInicial={consultaInicial} />;
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
