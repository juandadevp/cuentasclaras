"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { registrar } from "@/app/auth/actions";
import type { ResultadoAuth } from "@/lib/auth-tipos";
import { BotonOjo } from "@/components/ui/BotonOjo";
import { Campo } from "@/components/ui/Campo";
import { RequisitosClave } from "@/components/auth/RequisitosClave";
import { validarRegistro, type DatosRegistro, type ErroresRegistro } from "@/lib/validaciones";

const vacio: DatosRegistro = { nombre: "", email: "", telefono: "", clave: "", confirmar: "" };
const ordenCampos: (keyof DatosRegistro)[] = ["nombre", "email", "telefono", "clave", "confirmar"];

export function RegistroForm() {
  const [datos, setDatos] = useState<DatosRegistro>(vacio);
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosRegistro, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAuth>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores: ErroresRegistro = validarRegistro(datos);
  const error = (campo: keyof DatosRegistro) =>
    resultado.errores?.[campo] ?? (tocados[campo] || intentoEnvio ? errores[campo] : undefined);

  function cambiar(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    setResultado({});
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

    const formData = new FormData();
    ordenCampos.forEach((c) => formData.set(c, datos[c]));
    iniciarTransicion(async () => {
      // Si Supabase devuelve una sesión, la acción redirige al inicio.
      setResultado(await registrar(formData));
    });
  }

  if (resultado.requiereConfirmacion) {
    return (
      <div role="status" className="space-y-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">Revisa tu correo</h2>
        <p className="text-muted">
          Te enviamos un enlace de confirmación a <strong className="text-foreground">{datos.email.trim()}</strong>.
          Ábrelo para activar tu cuenta y luego inicia sesión.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-[10px] bg-brand-800 px-6 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
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
        <RequisitosClave clave={datos.clave} />
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
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
