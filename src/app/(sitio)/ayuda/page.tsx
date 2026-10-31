import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ayuda" };

const preguntas = [
  { p: "¿Cómo empiezo?", r: "Crea tu cuenta en «Crear cuenta gratis», inicia sesión y entra a tu portal. Allí puedes registrar tu primer gasto." },
  { p: "¿Quién puede ver mis gastos?", r: "Solo tú. Cada usuario tiene su propio espacio privado y nadie más puede ver tus datos." },
  { p: "¿Cómo registro un gasto?", r: "En el portal, entra a «Registrar gasto» y completa qué compraste, el valor, la fecha y la categoría. La tienda es opcional." },
  { p: "¿Cómo comparo precios de un producto?", r: "En «Recomendar compras» busca el producto. Verás el precio en distintas tiendas y puedes registrar la compra directamente." },
  { p: "¿Qué es «Mi ahorro»?", r: "Compara cada mes con el anterior y te muestra cuánto ahorraste o gastaste de más, en total y por categoría." },
  { p: "No me deja guardar un gasto, ¿qué hago?", r: "Si aparece el aviso «Falta crear la tabla de gastos» o «Falta actualizar la base de datos», faltan migraciones por ejecutar en Supabase." },
];

export default function AyudaPage() {
  return (
    <section className="bg-neutral-50 px-6 py-16 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Ayuda</h1>
        <p className="mt-4 text-lg text-muted">Respuestas rápidas a las dudas más comunes.</p>
        <div className="mt-8 space-y-3">
          {preguntas.map((q) => (
            <details key={q.p} className="group rounded-xl border border-border bg-surface px-5 py-4">
              <summary className="cursor-pointer font-semibold text-foreground">{q.p}</summary>
              <p className="mt-2 leading-relaxed text-muted">{q.r}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-muted">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-bold text-brand-700 hover:underline">
            Crea una gratis
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
