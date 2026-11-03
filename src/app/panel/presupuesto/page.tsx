import type { Metadata } from "next";
import { Suspense } from "react";
import { Presupuesto } from "@/components/panel/Presupuesto";

export const metadata: Metadata = { title: "Presupuesto" };

const unico = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function PresupuestoDelUsuario({ searchParams }: { searchParams: PageProps<"/panel/presupuesto">["searchParams"] }) {
  const p = await searchParams;
  return <Presupuesto mes={unico(p.mes)} categoria={unico(p.categoria)} />;
}

export default function PresupuestoPage(props: PageProps<"/panel/presupuesto">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <PresupuestoDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
