import type { Metadata } from "next";
import { Suspense } from "react";
import { Registrar } from "@/components/panel/Registrar";

export const metadata: Metadata = { title: "Registrar gasto" };

export default function RegistrarPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4.5rem)] bg-neutral-50" aria-busy />}>
      <Registrar />
    </Suspense>
  );
}
