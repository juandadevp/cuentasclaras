import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { ImagenDeFondo } from "@/components/ui/ImagenDeFondo";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] md:grid-cols-[2fr_3fr]">
      <aside className="hidden flex-col items-center justify-center gap-8 bg-menta px-8 py-12 md:flex">
        <div className="relative h-[26rem] w-full max-w-md">
          <ImagenDeFondo src="/login.png" ajuste="contain" />
        </div>
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Tus cuentas, <span className="text-brand-700">siempre claras.</span>
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-brand-800/75">
            Entra para registrar tus gastos, ver tus reportes y mantenerte dentro de tu presupuesto.
          </p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Bienvenido de nuevo</h1>
          <p className="mt-2 text-muted">Ingresa tus datos para continuar.</p>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-brand-700 hover:underline">
              Crea una gratis
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
