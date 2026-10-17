import type { Metadata } from "next";
import { Suspense } from "react";
import { Inicio } from "@/components/panel/Inicio";

export const metadata: Metadata = { title: "Inicio" };

export default function InicioPage() {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <Inicio />
    </Suspense>
  );
}
