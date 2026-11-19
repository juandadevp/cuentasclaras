import type { Metadata } from "next";
import { Suspense } from "react";
import { ResumenAnual } from "@/components/panel/ResumenAnual";

export const metadata: Metadata = { title: "Resumen anual" };

const unico = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function ResumenAnualDelUsuario({ searchParams }: { searchParams: PageProps<"/panel/resumen-anual">["searchParams"] }) {
  const p = await searchParams;
  return <ResumenAnual anio={unico(p.anio)} />;
}

export default function ResumenAnualPage(props: PageProps<"/panel/resumen-anual">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <ResumenAnualDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
