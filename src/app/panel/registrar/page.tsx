import type { Metadata } from "next";
import { Suspense } from "react";
import { Registrar } from "@/components/panel/Registrar";

export const metadata: Metadata = { title: "Registrar gasto" };

export default function RegistrarPage() {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <Registrar />
    </Suspense>
  );
}
