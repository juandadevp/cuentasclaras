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
        pie={
          <Link href="/recuperar" className="text-sm font-medium text-brand-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        }
        derecha={
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            className="rounded-md p-1.5 text-muted transition-colors hover:text-brand-700"
            aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {/* Contraseña visible (botón "Ocultar"): ojo cerrado. Oculta (botón "Ver"): ojo abierto. */}
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {verClave ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <path d="m1 1 22 22" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
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
