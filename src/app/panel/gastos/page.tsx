import type { Metadata } from "next";
import { Suspense } from "react";
import { Gastos } from "@/components/panel/Gastos";

export const metadata: Metadata = { title: "Mis gastos" };

async function GastosDelUsuario({ searchParams }: { searchParams: PageProps<"/panel/gastos">["searchParams"] }) {
  const p = await searchParams;
  const unico = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  return <Gastos mes={unico(p.mes)} q={unico(p.q)} categoria={unico(p.categoria)} />;
}

export default function GastosPage(props: PageProps<"/panel/gastos">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <GastosDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
