import type { Metadata } from "next";
import { Suspense } from "react";
import { Favoritos } from "@/components/panel/Favoritos";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritosPage() {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <Favoritos />
    </Suspense>
  );
}
