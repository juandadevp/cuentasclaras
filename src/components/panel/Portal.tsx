import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { EncabezadoPanel } from "@/components/panel/EncabezadoPanel";
import { formatearMoneda } from "@/lib/format";
import { hoyIso, nombreDelMes, rangoDelMes } from "@/lib/gastos";
import { gastosEntre } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuario } from "@/lib/supabase/usuario";
import { totalGastos } from "@/lib/utils";

interface Accion {
  href?: string;
  titulo: string;
  descripcion: string;
  icono: ReactNode;
  proximamente?: boolean;
}

const acciones: Accion[] = [
  {
    href: "/panel/registrar",
    titulo: "Registrar gasto",
    descripcion: "Anota lo que gastaste en segundos: descripción, valor, categoría y fecha.",
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
  {
    href: "/panel/resumen",
    titulo: "Resumen de gastos",
    descripcion: "Mira cuánto llevas en el mes, en qué categorías se va tu dinero y tu historial.",
    icono: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 16v-5M12 16V8M17 16v-8" />
      </>
    ),
  },
  {
    titulo: "Presupuesto mensual",
    descripcion: "Define un límite y recibe un aviso antes de pasarte.",
    proximamente: true,
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
  },
];

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

function Mosaico({ accion }: { accion: Accion }) {
  const contenido = (
    <>
      <span
        className={`grid size-16 place-items-center rounded-2xl ${
          accion.proximamente ? "bg-neutral-100 text-neutral-400" : "bg-menta text-brand-800 transition-colors group-hover:bg-brand-800 group-hover:text-white"
        }`}
      >
        <Icono>{accion.icono}</Icono>
      </span>
      <h2 className="mt-6 flex items-center gap-2 text-xl font-bold text-foreground">
        {accion.titulo}
        {accion.proximamente && (
          <span className="rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-bold text-amber-900">Próximamente</span>
        )}
      </h2>
      <p className="mt-2 leading-relaxed text-muted">{accion.descripcion}</p>
      {!accion.proximamente && (
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
          Entrar <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      )}
    </>
  );

  const base = "group flex flex-col rounded-3xl border border-border bg-surface p-8 shadow-sm";
  if (accion.proximamente || !accion.href) {
    return <div className={`${base} opacity-70`}>{contenido}</div>;
  }
  return (
    <Link href={accion.href} className={`${base} transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30`}>
      {contenido}
    </Link>
  );
}

/** Portal de inicio de cada usuario: accesos grandes a lo que puede hacer. */
export async function Portal() {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login");

  const hoy = hoyIso();
  const { mes, inicio, fin } = rangoDelMes(undefined, hoy);

  let total = 0;
  let cantidad = 0;
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const { gastos } = await gastosEntre(supabase, inicio, fin);
    total = totalGastos(gastos);
    cantidad = gastos.length;
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-neutral-50">
      <EncabezadoPanel etiqueta="Tu portal" titulo={`Hola, ${usuario.nombre.split(" ")[0]}`} subtitulo="¿Qué quieres hacer hoy?" />

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-20">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted">
            En {nombreDelMes(mes).toLowerCase()} llevas{" "}
            <strong className="text-xl font-extrabold text-foreground">{formatearMoneda(total)}</strong>{" "}
            en {cantidad} {cantidad === 1 ? "gasto" : "gastos"}.
          </p>
          <Link href="/panel/resumen" className="text-sm font-bold text-brand-700 hover:underline">
            Ver el detalle →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {acciones.map((a) => (
            <Mosaico key={a.titulo} accion={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
