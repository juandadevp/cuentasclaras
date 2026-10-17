"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { iniciarSesion } from "@/app/auth/actions";
import type { ResultadoAuth } from "@/lib/auth-tipos";
import { BotonOjo } from "@/components/ui/BotonOjo";
import { Campo } from "@/components/ui/Campo";
import { validarLogin, type DatosLogin } from "@/lib/validaciones";

export function LoginForm() {
  const [datos, setDatos] = useState<DatosLogin>({ email: "", clave: "" });
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosLogin, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAuth>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarLogin(datos);
  const error = (campo: keyof DatosLogin) =>
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
    const formulario = e.currentTarget;
    const primero = (["email", "clave"] as const).find((c) => errores[c]);
    if (primero) {
      (formulario.elements.namedItem(primero) as HTMLInputElement | null)?.focus();
      return;
    }

    const formData = new FormData();
    formData.set("email", datos.email);
    formData.set("clave", datos.clave);
    iniciarTransicion(async () => {
      // Si las credenciales son correctas, la acción redirige al inicio.
      setResultado(await iniciarSesion(formData));
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <Campo
        etiqueta="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        value={datos.email}
        onChange={cambiar}
        onBlur={salir}
        error={error("email")}
      />

      <Campo
        etiqueta="Contraseña"
        name="clave"
        type={verClave ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Tu contraseña"
        value={datos.clave}
        onChange={cambiar}
        onBlur={salir}
        error={error("clave")}
        pie={
          <Link href="/recuperar" className="text-sm font-medium text-brand-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        }
        derecha={<BotonOjo visible={verClave} onClick={() => setVerClave((v) => !v)} />}
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
        {pendiente ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
