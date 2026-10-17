import type { Metadata } from "next";
import { Suspense } from "react";
import { Resumen } from "@/components/panel/Resumen";

export const metadata: Metadata = { title: "Resumen de gastos" };

async function ResumenDelUsuario({ searchParams }: { searchParams: PageProps<"/panel/resumen">["searchParams"] }) {
  const { mes } = await searchParams;
  return <Resumen mesParam={typeof mes === "string" ? mes : undefined} />;
}

export default function ResumenPage(props: PageProps<"/panel/resumen">) {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4.5rem)] bg-neutral-50" aria-busy />}>
      <ResumenDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
