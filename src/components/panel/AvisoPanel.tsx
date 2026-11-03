import type { ReactNode } from "react";

/** Aviso destacado dentro de una pantalla del panel (p. ej. «falta ejecutar la migración»). */
export function AvisoPanel({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mb-6 rounded-xl border border-accent bg-accent/20 px-5 py-4 text-sm text-brand-800">
      {children}
    </p>
  );
}
