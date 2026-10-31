"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { solicitarRecuperacion } from "@/app/auth/actions";
import type { ResultadoAuth } from "@/lib/auth-tipos";
import { Campo } from "@/components/ui/Campo";
import { validarRecuperacion } from "@/lib/validaciones";

const iconoCorreo = (
  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export function RecuperarForm() {
  const [email, setEmail] = useState("");
  const [tocado, setTocado] = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAuth>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarRecuperacion({ email });
  const error = resultado.errores?.email ?? (tocado || intentoEnvio ? errores.email : undefined);

  function cambiar(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    setResultado({});
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    if (errores.email) {
      (e.currentTarget.elements.namedItem("email") as HTMLInputElement | null)?.focus();
      return;
    }

    const formData = new FormData();
    formData.set("email", email);
    iniciarTransicion(async () => {
      setResultado(await solicitarRecuperacion(formData));
    });
  }

  if (resultado.enlaceEnviado) {
    return (
      <div role="status" className="space-y-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">{iconoCorreo}</div>
        <h2 className="text-xl font-bold text-foreground">Revisa tu correo</h2>
        <p className="text-muted">
          Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-[10px] bg-brand-800 px-6 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <Campo
        etiqueta="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        maxLength={120}
        value={email}
        onChange={cambiar}
        onBlur={() => setTocado(true)}
        error={error}
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
        {pendiente ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
}
