"use client";

import { useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { crearIngreso } from "@/app/panel/ingresos/actions";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { tiposIngreso } from "@/config/site";
import { validarIngreso, type DatosIngreso, type ResultadoIngreso } from "@/lib/ingresos";
import { formatearMontoEscrito } from "@/lib/validaciones-gasto";

const campos: (keyof DatosIngreso)[] = ["descripcion", "tipo", "monto", "fecha"];

/** Formulario para registrar un ingreso. `hoy` (yyyy-mm-dd) se calcula en el servidor. */
export function FormularioIngreso({ hoy }: { hoy: string }) {
  const vacio: DatosIngreso = { descripcion: "", tipo: "", monto: "", fecha: hoy };
  const [datos, setDatos] = useState<DatosIngreso>(vacio);
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosIngreso, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIngreso>({});
  const [guardado, setGuardado] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarIngreso(datos, hoy);
  const error = (c: keyof DatosIngreso) => resultado.errores?.[c] ?? (tocados[c] || intentoEnvio ? errores[c] : undefined);

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: name === "monto" ? formatearMontoEscrito(value) : value }));
    setResultado({});
    setGuardado(false);
  }

  function salir(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    setTocados((t) => ({ ...t, [e.target.name]: true }));
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    const primero = campos.find((c) => errores[c]);
    if (primero) {
      (e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus();
      return;
    }

    const formData = new FormData();
    campos.forEach((c) => formData.set(c, datos[c]));
    iniciarTransicion(async () => {
      const r = await crearIngreso(formData);
      setResultado(r);
      if (!r.ok) return;
      setDatos(vacio);
      setTocados({});
      setIntentoEnvio(false);
      setGuardado(true);
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo
        etiqueta="¿De dónde viene el ingreso?"
        name="descripcion"
        placeholder="Ej. Salario de noviembre"
        maxLength={80}
        value={datos.descripcion}
        onChange={cambiar}
        onBlur={salir}
        error={error("descripcion")}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Selector
          etiqueta="Tipo"
          name="tipo"
          placeholder="Elige un tipo"
          value={datos.tipo}
          onChange={cambiar}
          onBlur={salir}
          error={error("tipo")}
        >
          {tiposIngreso.map((t) => (
            <option key={t.valor} value={t.valor} className="text-foreground">
              {t.etiqueta}
            </option>
          ))}
        </Selector>
        <Campo
          etiqueta="Valor (COP)"
          name="monto"
          inputMode="numeric"
          placeholder="1.500.000"
          value={datos.monto}
          onChange={cambiar}
          onBlur={salir}
          error={error("monto")}
        />
        <Campo
          etiqueta="Fecha"
          name="fecha"
          type="date"
          min="2000-01-01"
          max={hoy}
          value={datos.fecha}
          onChange={cambiar}
          onBlur={salir}
          error={error("fecha")}
        />
      </div>

      {resultado.mensaje ? (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {resultado.mensaje}
        </p>
      ) : null}
      {guardado ? (
        <p role="status" className="rounded-[10px] bg-brand-100 px-4 py-3 text-sm font-medium text-brand-800">
          ¡Ingreso guardado!
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {pendiente ? "Guardando…" : "+ Guardar ingreso"}
      </button>
    </form>
  );
}
