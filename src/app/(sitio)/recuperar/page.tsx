import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RecuperarForm } from "@/components/auth/RecuperarForm";

export const metadata: Metadata = { title: "Recuperar contraseña" };

async function AvisoDeEnlace({ searchParams }: { searchParams: PageProps<"/recuperar">["searchParams"] }) {
  const { error } = await searchParams;
  if (error !== "enlace") return null;
  return (
    <p role="alert" className="mb-5 rounded-[10px] bg-amber-50 px-4 py-3 text-sm text-amber-900">
      El enlace venció, ya se usó o se abrió en otro navegador. Pide uno nuevo y ábrelo en este mismo navegador.
    </p>
  );
}

export default function RecuperarPage(props: PageProps<"/recuperar">) {
  return (
    <section className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">¿Olvidaste tu contraseña?</h1>
        <p className="mt-2 text-muted">Escribe tu correo y te enviaremos un enlace para crear una nueva.</p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <Suspense fallback={null}>
            <AvisoDeEnlace searchParams={props.searchParams} />
          </Suspense>
          <RecuperarForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya la recordaste?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
