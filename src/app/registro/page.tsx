import type { Metadata } from "next";
import Link from "next/link";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { ImagenDeFondo } from "@/components/ui/ImagenDeFondo";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] md:grid-cols-[2fr_3fr]">
      <aside className="hidden flex-col items-center justify-center gap-8 bg-menta px-8 py-12 md:flex">
        <div className="relative h-80 w-full max-w-md">
          <ImagenDeFondo src="/registro.png" ajuste="contain" />
        </div>
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Empieza a ordenar <span className="text-brand-700">tus cuentas.</span>
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-brand-800/75">
            Crea tu cuenta gratis en menos de un minuto y controla tus gastos de cada mes.
          </p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Crea tu cuenta</h1>
          <p className="mt-2 text-muted">Completa tus datos para empezar.</p>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm">
            <RegistroForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
