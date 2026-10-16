"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/ui/Campo";

export function LoginForm() {
  const [verClave, setVerClave] = useState(false);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: conectar con la autenticación cuando exista el backend.
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <Campo
        etiqueta="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        required
      />

      <Campo
        etiqueta="Contraseña"
        name="password"
        type={verClave ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Tu contraseña"
        required
        extra={
          <Link href="/recuperar" className="text-sm font-medium text-brand-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        }
        derecha={
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:text-foreground"
            aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {verClave ? "Ocultar" : "Ver"}
          </button>
        }
      />

      <label className="flex items-center gap-2.5 text-sm text-muted">
        <input type="checkbox" name="recordarme" className="size-4 accent-brand-700" />
        Mantener la sesión iniciada
      </label>

      <button
        type="submit"
        className="w-full rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
