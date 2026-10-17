import type { Metadata } from "next";
import { Suspense } from "react";
import { Panel } from "@/components/panel/Panel";

export const metadata: Metadata = { title: "Mi panel" };

async function PanelDelUsuario({ searchParams }: { searchParams: PageProps<"/panel">["searchParams"] }) {
  const { mes } = await searchParams;
  return <Panel mesParam={typeof mes === "string" ? mes : undefined} />;
}

export default function PanelPage(props: PageProps<"/panel">) {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4.5rem)] bg-neutral-50" aria-busy />}>
      <PanelDelUsuario searchParams={props.searchParams} />
    </Suspense>
  );
}
