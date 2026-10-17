import type { Metadata } from "next";
import { Suspense } from "react";
import { Portal } from "@/components/panel/Portal";

export const metadata: Metadata = { title: "Mi portal" };

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4.5rem)] bg-neutral-50" aria-busy />}>
      <Portal />
    </Suspense>
  );
}
