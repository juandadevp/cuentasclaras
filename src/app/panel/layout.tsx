import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { MarcoPanel } from "@/components/panel/MarcoPanel";
import { obtenerUsuario } from "@/lib/supabase/usuario";

async function ConSesion({ children }: { children: ReactNode }) {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login");
  return (
    <MarcoPanel nombre={usuario.nombre} email={usuario.email}>
      {children}
    </MarcoPanel>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100" aria-busy />}>
      <ConSesion>{children}</ConSesion>
    </Suspense>
  );
}
