import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { hoyIso } from "@/lib/gastos";
import { gastoPorId } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Editar gasto" };

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Edicion({ params }: { params: PageProps<"/panel/gastos/[id]/editar">["params"] }) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const { id } = await params;
  if (!ES_UUID.test(id) || !supabaseConfigurado()) notFound();

  const supabase = await crearClienteServidor();
  // La seguridad por filas hace que solo se encuentren gastos del propio usuario.
  const { gasto, error } = await gastoPorId(supabase, id);
  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <TituloPagina titulo="Editar gasto" />
        <AvisoPanel>{mensajeDeErrorGasto(error)}</AvisoPanel>
      </div>
    );
  }
  if (!gasto) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Editar gasto" subtitulo="Cambia los datos y guarda." />
      <Tarjeta titulo="Datos del gasto">
        <FormularioGasto key={gasto.id} hoy={hoyIso()} gasto={gasto} />
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
