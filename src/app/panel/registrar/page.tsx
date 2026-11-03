import type { Metadata } from "next";
import { Suspense } from "react";
import { Registrar } from "@/components/panel/Registrar";
import { leerParametrosRegistro } from "@/lib/precios/compra";

export const metadata: Metadata = { title: "Registrar gasto" };

async function ConDatos({ searchParams }: { searchParams: PageProps<"/panel/registrar">["searchParams"] }) {
  // Los valores con los que puede llegar el formulario vienen de la barra de direcciones: se limpian antes de usarlos.
  const { valoresIniciales, compra } = leerParametrosRegistro(await searchParams);
  return <Registrar valoresIniciales={valoresIniciales} compra={compra} />;
}

export default function RegistrarPage(props: PageProps<"/panel/registrar">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <ConDatos searchParams={props.searchParams} />
    </Suspense>
  );
}
