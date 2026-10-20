import Link from "next/link";
import { connection } from "next/server";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { hoyIso } from "@/lib/gastos";
import { ultimosGastos } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Gasto } from "@/types/gasto";

export async function Registrar({ prellenado }: { prellenado?: { descripcion?: string; monto?: string; categoria?: string } }) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  let recientes: Gasto[] = [];
  let falloLaConsulta = false;

  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await ultimosGastos(supabase, 5);
    recientes = r.gastos;
    falloLaConsulta = Boolean(r.error);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Registrar gasto" subtitulo="Anota un gasto nuevo en segundos." />

      {falloLaConsulta && (
        <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Falta crear la tabla de gastos. Ejecuta la migración <strong>gastos</strong> en el SQL Editor de Supabase (carpeta{" "}
          <code>supabase/migrations</code>).
        </p>
      )}

      <Tarjeta titulo="Nuevo gasto">
        <FormularioGasto hoy={hoy} valoresIniciales={prellenado} />
      </Tarjeta>

      <Tarjeta
        className="mt-6"
        titulo="Tus últimos gastos"
        acciones={
          <Link href="/panel/gastos" className="text-sm font-bold text-brand-700 hover:underline">
            Ver todos →
          </Link>
        }
      >
        <TablaGastos gastos={recientes} vacio="Todavía no has registrado gastos. El primero aparecerá aquí." />
      </Tarjeta>
    </div>
  );
}
