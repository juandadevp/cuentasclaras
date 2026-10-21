"use client";

import { useState, useTransition } from "react";
import { generarConsejos, type ResultadoConsejos } from "@/app/panel/ahorro/actions";

/** Botón que pide los consejos a la IA y los muestra en una lista. */
export function AsesorIA() {
  const [resultado, setResultado] = useState<ResultadoConsejos | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(async () => setResultado(await generarConsejos()))}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:opacity-60"
      >
        ✨ {pendiente ? "Analizando tus gastos…" : resultado?.ok ? "Generar de nuevo" : "Generar consejos"}
      </button>

      <div aria-live="polite" className="mt-5">
        {resultado && !resultado.ok && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {resultado.mensaje}
          </p>
        )}
        {resultado?.ok && (
          <>
            <ul className="space-y-3">
              {resultado.consejos.map((c, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-menta/40 px-4 py-3 text-[15px] text-foreground">
                  <span aria-hidden>💡</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              {resultado.fuente === "ia" ? "Generado con Gemini a partir de tus totales por mes y categoría." : "Consejos calculados automáticamente (sin IA)."}
              {resultado.mensaje && <> {resultado.mensaje}</>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
