import type { Metadata } from "next";
import { Suspense } from "react";
import { Registrar } from "@/components/panel/Registrar";
import { categorias } from "@/config/site";
import { formatearMontoEscrito } from "@/lib/validaciones-gasto";

export const metadata: Metadata = { title: "Registrar gasto" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

async function ConDatos({ searchParams }: { searchParams: PageProps<"/panel/registrar">["searchParams"] }) {
  const p = await searchParams;
  // Datos que pueden venir de "Recomendar compras": se limpian antes de usarlos.
  const categoria = texto(p.categoria);
  const prellenado = {
    descripcion: texto(p.descripcion).replace(/\s+/g, " ").trim().slice(0, 80),
    monto: formatearMontoEscrito(texto(p.monto)),
    categoria: categorias.some((c) => c.valor === categoria) ? categoria : "",
  };
  return <Registrar prellenado={prellenado} />;
}

export default function RegistrarPage(props: PageProps<"/panel/registrar">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <ConDatos searchParams={props.searchParams} />
    </Suspense>
  );
}
