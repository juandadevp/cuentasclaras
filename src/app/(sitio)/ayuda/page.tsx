import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ayuda" };

const preguntas = [
  {
    p: "¿Cómo empiezo?",
    r: "Crea tu cuenta en «Crear cuenta», confirma tu correo si te lo pedimos e inicia sesión. Al entrar verás tu panel; desde allí puedes registrar tu primer gasto.",
  },
  {
    p: "¿Quién puede ver mis gastos?",
    r: "Solo tú. Cada persona tiene su propio espacio privado y nadie más puede ver ni cambiar tus datos.",
  },
  {
    p: "¿Cómo registro un gasto?",
    r: "En el panel entra a «Registrar gasto» y completa qué compraste, el valor, la fecha y la categoría. La tienda es opcional.",
  },
  {
    p: "¿Cómo busco, corrijo o elimino un gasto?",
    r: "En «Mis gastos» puedes buscar por concepto, filtrar por categoría y cambiar de mes. Cada gasto tiene un botón para editarlo y otro para eliminarlo (te pedimos confirmar antes de borrarlo).",
  },
  {
    p: "¿Cómo uso el presupuesto?",
    r: "En «Presupuesto» fijas un límite mensual para cada categoría. Te mostramos cuánto llevas gastado frente a ese límite y si vas bien, cerca o ya te pasaste.",
  },
  {
    p: "Olvidé mi contraseña, ¿qué hago?",
    r: "En «Iniciar sesión» toca «¿Olvidaste tu contraseña?», escribe tu correo y te enviaremos un enlace para crear una nueva. Ábrelo en el mismo navegador y revisa también la carpeta de spam.",
  },
];

export default function AyudaPage() {
  return (
    <section className="px-6 py-16 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Ayuda</h1>
        <p className="mt-4 text-lg text-muted">Respuestas rápidas a las dudas más comunes.</p>
        <div className="mt-8 space-y-3">
          {preguntas.map((q) => (
            <details key={q.p} className="group rounded-xl border border-border bg-surface px-5 py-4 open:border-brand-300">
              <summary className="cursor-pointer font-semibold text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                {q.p}
              </summary>
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
        <p className="mt-2 text-muted">
          ¿No encontraste lo que buscabas?{" "}
          <Link href="/contacto" className="font-bold text-brand-700 hover:underline">
            Escríbenos
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
