import type { ReactNode } from "react";
import { MarcoSitio } from "@/components/layout/MarcoSitio";

export default function SitioLayout({ children }: { children: ReactNode }) {
  return <MarcoSitio>{children}</MarcoSitio>;
}
