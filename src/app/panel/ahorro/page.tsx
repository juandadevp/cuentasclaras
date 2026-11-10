import type { Metadata } from "next";
import { Suspense } from "react";
import { Ahorro } from "@/components/panel/Ahorro";

export const metadata: Metadata = { title: "Mi ahorro" };

export default function AhorroPage() {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <Ahorro />
    </Suspense>
  );
}
