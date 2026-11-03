import type { Metadata } from "next";
import { Suspense } from "react";
import { Gastos } from "@/components/panel/Gastos";
import { leerFiltros } from "@/lib/gastos";

export const metadata: Metadata = { title: "Mis gastos" };

async function GastosDelUsuario({ searchParams }: { searchParams: PageProps<"/panel/gastos">["searchParams"] }) {
  return <Gastos filtros={leerFiltros(await searchParams)} />;
}

export default function GastosPage(props: PageProps<"/panel/gastos">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <GastosDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
