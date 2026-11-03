import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { MarcoPanel } from "@/components/panel/MarcoPanel";
import { obtenerUsuario } from "@/lib/supabase/usuario";

// Segunda barrera además del proxy: sin sesión no se muestra nada del panel.
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
    <Suspense fallback={<div className="min-h-screen" aria-busy />}>
      <ConSesion>{children}</ConSesion>
    </Suspense>
  );
}
