import Link from "next/link";
import { BotonQuitarMetaAhorro } from "@/components/panel/BotonQuitarMetaAhorro";
import { FormularioMetaAhorro } from "@/components/panel/FormularioMetaAhorro";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { formatearMoneda } from "@/lib/format";
import type { EstadoMeta, MetaAhorro, ProgresoMeta } from "@/lib/metas-ahorro";

interface Props {
  /** Nombre del mes para el título, p. ej. «Noviembre de 2026». */
  mes: string;
  /** Mes en formato yyyy-mm, para el formulario. */
  mesIso: string;
  /** Fecha de hoy (yyyy-mm-dd), para validar en el formulario. */
  hoy: string;
  meta: MetaAhorro | null;
  progreso: ProgresoMeta;
  /** Si falló la carga de los ingresos, no se calcula el avance. */
  falloIngresos: boolean;
}

const estados: Record<EstadoMeta, { texto: string; barra: string }> = {
  "sin-meta": { texto: "Sin meta", barra: "bg-neutral-100" },
  "sin-ingresos": { texto: "Sin ingresos", barra: "bg-neutral-100" },
  "por-debajo": { texto: "Por debajo de la meta", barra: "bg-accent" },
  alcanzada: { texto: "Meta alcanzada", barra: "bg-brand-500" },
  superada: { texto: "Meta superada", barra: "bg-brand-500" },
};

function textoDelAvance(progreso: ProgresoMeta, falloIngresos: boolean) {
  if (progreso.estado === "sin-meta") return "Aún no fijas una meta para este mes.";
  if (falloIngresos) return "No pudimos cargar tus ingresos, por eso no calculamos tu avance.";
  switch (progreso.estado) {
    case "sin-ingresos":
      return null;
    case "por-debajo":
      return `Vas en ${progreso.porcentaje} % de tu meta. Te faltan ${formatearMoneda(progreso.diferencia ?? 0)}.`;
    case "alcanzada":
      return "¡Alcanzaste tu meta!";
    default:
      return `Superaste tu meta por ${formatearMoneda(progreso.diferencia ?? 0)} (${progreso.porcentaje} %).`;
  }
}

/** Meta de ahorro del mes: el avance dicho con texto y con una barra accesible, el formulario y el botón para quitarla. */
export function TarjetaMetaAhorro({ mes, mesIso, hoy, meta, progreso, falloIngresos }: Props) {
  const avance = textoDelAvance(progreso, falloIngresos);
  const conBarra = meta !== null && !falloIngresos && progreso.porcentaje !== null;
  const ancho = Math.min(progreso.porcentaje ?? 0, 100);
  const estado = estados[progreso.estado];

  return (
    <Tarjeta titulo={`Meta de ahorro de ${mes}`} className="mb-6">
      {meta ? (
        <p className="text-sm text-muted">
          Tu meta: <strong className="text-xl font-extrabold text-foreground">{formatearMoneda(meta.monto)}</strong>
        </p>
      ) : null}

      {avance ? <p className="mt-2 text-sm font-semibold text-foreground">{avance}</p> : null}
      {meta && !falloIngresos && progreso.estado === "sin-ingresos" ? (
        <p className="mt-2 text-sm text-muted">
          Registra tus ingresos de este mes para ver tu avance.{" "}
          <Link href="/panel/ingresos" className="font-bold text-brand-700 hover:underline">
            Ir a Ingresos
          </Link>
        </p>
      ) : null}

      {conBarra ? (
        <div
          role="progressbar"
          aria-label="Avance de la meta de ahorro"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ancho}
          aria-valuetext={`${progreso.porcentaje} % de la meta. ${estado.texto}`}
          className="mt-2 h-3 overflow-hidden rounded-full bg-neutral-100"
        >
          <div className={`h-full rounded-full ${estado.barra}`} style={{ width: `${ancho}%` }} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <FormularioMetaAhorro key={`${mesIso}-${meta?.monto ?? "sin-meta"}`} mes={mesIso} hoy={hoy} montoInicial={meta?.monto} />
        </div>
        {meta ? <BotonQuitarMetaAhorro id={meta.id} /> : null}
      </div>
    </Tarjeta>
  );
}
