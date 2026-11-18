import type { Metadata } from "next";
import { Suspense } from "react";
import { Ingresos } from "@/components/panel/Ingresos";

export const metadata: Metadata = { title: "Ingresos" };

const unico = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function IngresosDelUsuario({ searchParams }: { searchParams: PageProps<"/panel/ingresos">["searchParams"] }) {
  const p = await searchParams;
  return <Ingresos mes={unico(p.mes)} />;
}

export default function IngresosPage(props: PageProps<"/panel/ingresos">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <IngresosDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
