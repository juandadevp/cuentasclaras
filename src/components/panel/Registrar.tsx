import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { hoyIso } from "@/lib/gastos";
import { ultimosGastos } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { DatosGasto } from "@/lib/validaciones-gasto";
import type { Gasto } from "@/types/gasto";

/** Pantalla «Registrar gasto»: formulario y los últimos gastos. */
export async function Registrar({ valoresIniciales }: { valoresIniciales?: Partial<DatosGasto> }) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  let recientes: Gasto[] = [];
  let aviso: string | undefined;

  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await ultimosGastos(supabase, 5);
    recientes = r.gastos;
    if (r.error) aviso = mensajeDeErrorGasto(r.error);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Registrar gasto" subtitulo="Anota un gasto nuevo en segundos." />

      {aviso ? <AvisoPanel>{aviso}</AvisoPanel> : null}

      <Tarjeta titulo="Nuevo gasto">
        {/* La key reinicia el formulario cuando cambian los valores iniciales (p. ej. al llegar desde otra pantalla). */}
        <FormularioGasto key={JSON.stringify(valoresIniciales ?? {})} hoy={hoy} valoresIniciales={valoresIniciales} />
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
