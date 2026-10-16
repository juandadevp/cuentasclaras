import type { ReactNode } from "react";

export function Card({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border border-t-4 border-t-brand-800 bg-surface p-5 shadow-sm">
      {titulo && <h2 className="mb-3 text-sm font-medium text-muted">{titulo}</h2>}
      {children}
    </section>
  );
}
