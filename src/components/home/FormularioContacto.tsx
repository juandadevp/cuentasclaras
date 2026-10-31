"use client";

import { useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { enviarContacto, type ResultadoContacto } from "@/app/(sitio)/contacto/actions";
import { Campo } from "@/components/ui/Campo";
import { asuntosContacto, validarContacto, type DatosContacto } from "@/lib/validaciones-contacto";

const vacio: DatosContacto = { nombre: "", email: "", asunto: "consulta", mensaje: "" };
const estiloCaja =
  "w-full rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] text-foreground outline-none transition placeholder:text-neutral-400 focus:ring-4";

export function FormularioContacto() {
  const [datos, setDatos] = useState<DatosContacto>(vacio);
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosContacto, boolean>>>({});
  const [intento, setIntento] = useState(false);
  const [resultado, setResultado] = useState<ResultadoContacto>({});
  const [pendiente, iniciar] = useTransition();

  const errores = validarContacto(datos);
  const error = (c: keyof DatosContacto) => resultado.errores?.[c] ?? (tocados[c] || intento ? errores[c] : undefined);

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    setResultado((r) => (r.ok ? r : {}));
  }
  const salir = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => setTocados((t) => ({ ...t, [e.target.name]: true }));

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntento(true);
    const primero = (["nombre", "email", "asunto", "mensaje"] as const).find((c) => errores[c]);
    if (primero) {
      (e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus();
      return;
    }
    const formData = new FormData();
    for (const [k, v] of Object.entries(datos)) formData.set(k, v);
    iniciar(async () => {
      const r = await enviarContacto(formData);
      setResultado(r);
      if (r.ok) {
        setDatos(vacio);
        setTocados({});
        setIntento(false);
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

  const borde = (c: keyof DatosContacto) => (error(c) ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15" : "border-border focus:border-brand-500 focus:ring-brand-500/15");

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre" name="nombre" autoComplete="name" placeholder="Ana Pérez" value={datos.nombre} onChange={cambiar} onBlur={salir} error={error("nombre")} />
        <Campo etiqueta="Correo electrónico" name="email" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" value={datos.email} onChange={cambiar} onBlur={salir} error={error("email")} />
      </div>

      <div>
        <label htmlFor="asunto" className="mb-1.5 block text-sm font-semibold text-foreground">
          Asunto
        </label>
        <select id="asunto" name="asunto" value={datos.asunto} onChange={cambiar} className={`${estiloCaja} ${borde("asunto")}`}>
          {asuntosContacto.map((a) => (
            <option key={a.valor} value={a.valor}>
              {a.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-semibold text-foreground">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          maxLength={1000}
          placeholder="Cuéntanos en qué podemos ayudarte"
          value={datos.mensaje}
          onChange={cambiar}
          onBlur={salir}
          aria-invalid={error("mensaje") ? true : undefined}
          className={`${estiloCaja} resize-y ${borde("mensaje")}`}
        />
        {error("mensaje") && (
          <p role="alert" className="mt-1.5 text-sm text-rose-600">
            {error("mensaje")}
          </p>
        )}
      </div>

      {resultado.mensaje && (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {resultado.mensaje}
        </p>
      )}

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
