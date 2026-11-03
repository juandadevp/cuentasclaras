import type { Metadata } from "next";
import { Suspense } from "react";
import { Registrar } from "@/components/panel/Registrar";
import { esCategoria, formatearMontoEscrito, normalizarDescripcion, type DatosGasto } from "@/lib/validaciones-gasto";

export const metadata: Metadata = { title: "Registrar gasto" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

async function ConDatos({ searchParams }: { searchParams: PageProps<"/panel/registrar">["searchParams"] }) {
  const p = await searchParams;

  // Los valores con los que puede llegar el formulario vienen de la barra de direcciones: se limpian antes de usarlos.
  const valoresIniciales: Partial<DatosGasto> = {};
  const descripcion = normalizarDescripcion(texto(p.descripcion)).slice(0, 80);
  const monto = formatearMontoEscrito(texto(p.monto));
  const categoria = texto(p.categoria);
  const tienda = normalizarDescripcion(texto(p.tienda)).slice(0, 80);
  if (descripcion) valoresIniciales.descripcion = descripcion;
  if (monto) valoresIniciales.monto = monto;
  if (esCategoria(categoria)) valoresIniciales.categoria = categoria;
  if (tienda) valoresIniciales.tienda = tienda;

  return <Registrar valoresIniciales={valoresIniciales} />;
}

export default function RegistrarPage(props: PageProps<"/panel/registrar">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <ConDatos searchParams={props.searchParams} />
    </Suspense>
  );
}
