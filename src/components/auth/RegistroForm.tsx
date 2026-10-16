"use client";

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { BotonOjo } from "@/components/ui/BotonOjo";
import { Campo } from "@/components/ui/Campo";
import {
  requisitosClave,
  validarRegistro,
  type DatosRegistro,
  type ErroresRegistro,
} from "@/lib/validaciones";

const vacio: DatosRegistro = { nombre: "", email: "", telefono: "", clave: "", confirmar: "" };
const ordenCampos: (keyof DatosRegistro)[] = ["nombre", "email", "telefono", "clave", "confirmar"];

export function RegistroForm() {
  const [datos, setDatos] = useState<DatosRegistro>(vacio);
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosRegistro, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const errores: ErroresRegistro = validarRegistro(datos);
  const error = (campo: keyof DatosRegistro) =>
    tocados[campo] || intentoEnvio ? errores[campo] : undefined;

  function cambiar(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setEnviado(false);
    setDatos((d) => ({ ...d, [name]: value }));
  }

  function salir(e: FocusEvent<HTMLInputElement>) {
    setTocados((t) => ({ ...t, [e.target.name]: true }));
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    const primero = ordenCampos.find((c) => errores[c]);
    if (primero) {
      (e.currentTarget.elements.namedItem(primero) as HTMLInputElement | null)?.focus();
      return;
    }
    // TODO: enviar los datos al servidor cuando exista el backend.
    setEnviado(true);
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <Campo
        etiqueta="Nombre completo"
        name="nombre"
        autoComplete="name"
        placeholder="Ana María Pérez"
        maxLength={80}
        value={datos.nombre}
        onChange={cambiar}
        onBlur={salir}
        error={error("nombre")}
      />

      <Campo
        etiqueta="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        maxLength={120}
        value={datos.email}
        onChange={cambiar}
        onBlur={salir}
        error={error("email")}
      />

      <Campo
        etiqueta="Teléfono celular"
        name="telefono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="300 123 4567"
        maxLength={18}
        value={datos.telefono}
        onChange={cambiar}
        onBlur={salir}
        error={error("telefono")}
        ayuda="Celular de 10 dígitos que empiece por 3."
      />

      <div>
        <Campo
          etiqueta="Contraseña"
          name="clave"
          type={verClave ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Crea una contraseña"
          maxLength={64}
          value={datos.clave}
          onChange={cambiar}
          onBlur={salir}
          error={error("clave")}
          derecha={<BotonOjo visible={verClave} onClick={() => setVerClave((v) => !v)} />}
        />
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5" aria-label="Requisitos de la contraseña">
          {requisitosClave.map((r) => {
            const ok = r.cumple(datos.clave);
            return (
              <li
                key={r.id}
                className={`flex items-center gap-1.5 text-xs ${ok ? "font-medium text-brand-700" : "text-muted"}`}
              >
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {ok ? <path d="m5 12 5 5 9-10" /> : <circle cx="12" cy="12" r="8" />}
                </svg>
                {r.texto}
              </li>
            );
          })}
        </ul>
      </div>

      <Campo
        etiqueta="Confirmar contraseña"
        name="confirmar"
        type={verConfirmar ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Repite tu contraseña"
        maxLength={64}
        value={datos.confirmar}
        onChange={cambiar}
        onBlur={salir}
        error={error("confirmar")}
        derecha={<BotonOjo visible={verConfirmar} onClick={() => setVerConfirmar((v) => !v)} />}
      />

      {enviado && (
        <p role="status" className="rounded-[10px] bg-brand-100 px-4 py-3 text-sm text-brand-800">
          Datos válidos. Falta conectar el registro con el servidor para crear la cuenta.
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      >
        Crear cuenta
      </button>
    </form>
  );
}
