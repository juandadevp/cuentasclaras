import Link from "next/link";
import { redirect } from "next/navigation";
import { EncabezadoPanel } from "@/components/panel/EncabezadoPanel";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { ListaGastos } from "@/components/panel/ListaGastos";
import { hoyIso } from "@/lib/gastos";
import { ultimosGastos } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuario } from "@/lib/supabase/usuario";
import type { Gasto } from "@/types/gasto";

export async function Registrar() {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login");

  let recientes: Gasto[] = [];
  let falloLaConsulta = false;
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await ultimosGastos(supabase, 5);
    recientes = r.gastos;
    falloLaConsulta = Boolean(r.error);
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-neutral-50">
      <EncabezadoPanel etiqueta="Gastos" titulo="Registrar gasto" subtitulo="Anota un gasto nuevo en segundos." volver />

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-20">
        {falloLaConsulta && (
          <p role="alert" className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Falta crear la tabla de gastos. Ejecuta la migración <strong>gastos</strong> en el SQL Editor de Supabase (carpeta{" "}
            <code>supabase/migrations</code>).
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Nuevo gasto</h2>
            <div className="mt-5">
              <FormularioGasto hoy={hoyIso()} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Tus últimos gastos</h2>
              <Link href="/panel/resumen" className="text-sm font-bold text-brand-700 hover:underline">
                Ver resumen →
              </Link>
            </div>
            <div className="mt-5">
              <ListaGastos gastos={recientes} vacio="Todavía no has registrado gastos. El primero aparecerá aquí." />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
