import type { Metadata } from "next";
import Link from "next/link";
import { FormularioContacto } from "@/components/home/FormularioContacto";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <>
      <section className="bg-menta px-6 py-14 lg:px-20">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Contacto</h1>
          <p className="mt-3 max-w-xl text-lg text-brand-800/80">¿Dudas, sugerencias o algún problema con la app? Escríbenos y te respondemos lo antes posible.</p>
        </div>
      </section>

      <section className="bg-neutral-50 px-6 py-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <FormularioContacto />
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="font-bold text-foreground">¿Buscas una respuesta rápida?</h2>
              <p className="mt-2 text-sm text-muted">Revisa las preguntas frecuentes sobre registros, precios y consejos de ahorro.</p>
              <Link href="/ayuda" className="mt-4 inline-block text-sm font-bold text-brand-700 hover:underline">
                Ir a ayuda →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
