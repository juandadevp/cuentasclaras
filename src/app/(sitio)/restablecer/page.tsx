import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RestablecerForm } from "@/components/auth/RestablecerForm";
import { obtenerUsuario } from "@/lib/supabase/usuario";

export const metadata: Metadata = { title: "Nueva contraseña" };

/** Solo se llega aquí con el enlace del correo, que deja una sesión temporal. Sin ella, se pide un enlace nuevo. */
async function ConEnlaceValido() {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/recuperar?error=enlace");
  return <RestablecerForm />;
}

export default function RestablecerPage() {
  return (
    <section className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Crea tu nueva contraseña</h1>
        <p className="mt-2 text-muted">Elige una contraseña que no hayas usado antes.</p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <Suspense fallback={<div aria-busy className="h-64" />}>
            <ConEnlaceValido />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
