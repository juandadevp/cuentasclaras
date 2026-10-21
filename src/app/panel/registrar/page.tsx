import type { Metadata } from "next";
import { Suspense } from "react";
import { Registrar, type CompraRecomendada } from "@/components/panel/Registrar";
import { categorias } from "@/config/site";
import { esRubro } from "@/lib/precios/rubros";
import { formatearMontoEscrito, normalizarDescripcion } from "@/lib/validaciones-gasto";

export const metadata: Metadata = { title: "Registrar gasto" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

const soloHttps = (v: string) => {
  try {
    return v.length <= 600 && new URL(v).protocol === "https:" ? v : undefined;
  } catch {
    return undefined;
  }
};

async function ConDatos({ searchParams }: { searchParams: PageProps<"/panel/registrar">["searchParams"] }) {
  const p = await searchParams;

  // Datos que pueden venir de "Recomendar compras": se limpian antes de usarlos, vienen de la barra de direcciones.
  const categoria = texto(p.categoria);
  const prellenado = {
    descripcion: normalizarDescripcion(texto(p.descripcion)).slice(0, 80),
    monto: formatearMontoEscrito(texto(p.monto)),
    categoria: categorias.some((c) => c.valor === categoria) ? categoria : "",
    tienda: normalizarDescripcion(texto(p.tienda)).slice(0, 80),
  };

  const tipo = texto(p.tipo);
  const compra: CompraRecomendada | undefined =
    texto(p.origen) === "recomendar" && prellenado.descripcion && prellenado.monto
      ? {
          producto: prellenado.descripcion,
          precio: Number(prellenado.monto.replace(/\D/g, "")),
          tienda: prellenado.tienda || undefined,
          enlace: soloHttps(texto(p.enlace)),
          imagen: soloHttps(texto(p.imagen)),
          tipo: esRubro(tipo) ? tipo : undefined,
        }
      : undefined;

  return <Registrar prellenado={prellenado} compra={compra} />;
}

export default function RegistrarPage(props: PageProps<"/panel/registrar">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <ConDatos searchParams={props.searchParams} />
    </Suspense>
  );
}
