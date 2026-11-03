import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { MenuPerfil } from "@/components/auth/MenuPerfil";
import { Logo } from "@/components/ui/Logo";
import { obtenerUsuario } from "@/lib/supabase/usuario";

// Segunda barrera además del proxy: sin sesión no se muestra nada del panel.
async function ConSesion({ children }: { children: ReactNode }) {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login");
  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <Logo />
        <MenuPerfil nombre={usuario.nombre} email={usuario.email} />
      </header>
      <main className="flex-1 px-6 py-10">{children}</main>
    </>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy />}>
      <ConSesion>{children}</ConSesion>
    </Suspense>
  );
}
