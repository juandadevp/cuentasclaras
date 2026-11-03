"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { enviarContacto } from "@/app/(sitio)/contacto/actions";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import type { DatosContacto, ResultadoContacto } from "@/lib/contacto-tipos";
import { asuntosContacto, LIMITES_CONTACTO, validarContacto } from "@/lib/validaciones-contacto";

const vacio: DatosContacto = { nombre: "", correo: "", asunto: "consulta", mensaje: "" };
const campos = ["nombre", "correo", "asunto", "mensaje"] as const;

export function FormularioContacto() {
  const [datos, setDatos] = useState<DatosContacto>(vacio);
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosContacto, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [resultado, setResultado] = useState<ResultadoContacto>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarContacto(datos);
  const error = (c: keyof DatosContacto) => resultado.errores?.[c] ?? (tocados[c] || intentoEnvio ? errores[c] : undefined);

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    setResultado({});
  }

  const salir = (e: { target: { name: string } }) => setTocados((t) => ({ ...t, [e.target.name]: true }));

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    const primero = campos.find((c) => errores[c]);
    if (primero) {
      (e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus();
      return;
    }

    const formData = new FormData();
    for (const c of campos) formData.set(c, datos[c]);
    iniciarTransicion(async () => {
      const r = await enviarContacto(formData);
      setResultado(r);
      if (r.ok) {
        setDatos(vacio);
        setTocados({});
        setIntentoEnvio(false);
      }
    });
  }

  if (resultado.ok) {
    return (
      <div role="status" className="rounded-2xl bg-menta/50 px-6 py-8 text-center">
        <p className="text-xl font-bold text-foreground">¡Mensaje enviado!</p>
        <p className="mt-2 text-muted">Gracias por escribirnos. Te responderemos lo antes posible.</p>
        <button type="button" onClick={() => setResultado({})} className="mt-5 text-sm font-bold text-brand-700 hover:underline">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const errorMensaje = error("mensaje");

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          etiqueta="Nombre"
          name="nombre"
          autoComplete="name"
          placeholder="Ana Pérez"
          maxLength={LIMITES_CONTACTO.nombre.max}
          value={datos.nombre}
          onChange={cambiar}
          onBlur={salir}
          error={error("nombre")}
        />
        <Campo
          etiqueta="Correo electrónico"
          name="correo"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          maxLength={LIMITES_CONTACTO.correo.max}
          value={datos.correo}
          onChange={cambiar}
          onBlur={salir}
          error={error("correo")}
        />
      </div>

      <Selector etiqueta="Asunto" name="asunto" value={datos.asunto} onChange={cambiar} onBlur={salir} error={error("asunto")}>
        {asuntosContacto.map((a) => (
          <option key={a.valor} value={a.valor}>
            {a.etiqueta}
          </option>
        ))}
      </Selector>

      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-semibold text-foreground">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          maxLength={LIMITES_CONTACTO.mensaje.max}
          placeholder="Cuéntanos en qué podemos ayudarte"
          value={datos.mensaje}
          onChange={cambiar}
          onBlur={salir}
          aria-invalid={errorMensaje ? true : undefined}
          aria-describedby={errorMensaje ? "mensaje-error" : undefined}
          className={`w-full resize-y rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] text-foreground outline-none transition placeholder:text-neutral-400 focus:ring-4 ${
            errorMensaje
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-border focus:border-brand-500 focus:ring-brand-500/15"
          }`}
        />
        <div className="mt-1.5 flex items-start justify-between gap-3">
          {errorMensaje ? (
            <p id="mensaje-error" role="alert" className="text-sm text-rose-600">
              {errorMensaje}
            </p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs text-muted">
            {datos.mensaje.length}/{LIMITES_CONTACTO.mensaje.max}
          </span>
        </div>
      </div>

      {resultado.mensaje ? (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {resultado.mensaje}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pendiente ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
