import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { hoyIso } from "@/lib/gastos";
import { gastoPorId } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Editar gasto" };

async function Edicion({ params }: { params: PageProps<"/panel/gastos/[id]/editar">["params"] }) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !supabaseConfigurado()) notFound();

  const supabase = await crearClienteServidor();
  // La seguridad por filas hace que solo se encuentren gastos del propio usuario.
  const { gasto } = await gastoPorId(supabase, id);
  if (!gasto) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Editar gasto" subtitulo="Cambia los datos y guarda." />
      <Tarjeta titulo="Datos del gasto">
        <FormularioGasto hoy={hoyIso()} gasto={gasto} />
      </Tarjeta>
    </div>
  );
}

export default function EditarGastoPage(props: PageProps<"/panel/gastos/[id]/editar">) {
  return (
    <Suspense fallback={<div aria-busy className="h-96" />}>
      <Edicion params={props.params} />
    </Suspense>
  );
}
