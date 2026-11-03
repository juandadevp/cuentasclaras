import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerUsuario } from "@/lib/supabase/usuario";

export const metadata: Metadata = { title: "Inicio" };

async function Saludo() {
  const usuario = await obtenerUsuario();
  return <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Hola, {usuario?.nombre}</h1>;
}

export default function InicioPage() {
  return (
    <>
      <Suspense fallback={<div aria-busy className="h-9" />}>
        <Saludo />
      </Suspense>
      <p className="mt-3 text-muted">Tu espacio privado está listo. Aquí llegará el portal de gastos en el siguiente módulo.</p>
    </>
  );
}
