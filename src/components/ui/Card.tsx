import type { ReactNode } from "react";

export function Card({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {titulo && <h2 className="mb-3 text-sm font-medium text-zinc-500">{titulo}</h2>}
      {children}
    </section>
  );
}
