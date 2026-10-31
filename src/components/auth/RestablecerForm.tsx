"use client";

import { useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { restablecerClave } from "@/app/auth/actions";
import type { ResultadoAuth } from "@/lib/auth-tipos";
import { BotonOjo } from "@/components/ui/BotonOjo";
import { Campo } from "@/components/ui/Campo";
import { RequisitosClave } from "@/components/auth/RequisitosClave";
import { validarNuevaClave, type DatosNuevaClave } from "@/lib/validaciones";

const ordenCampos: (keyof DatosNuevaClave)[] = ["clave", "confirmar"];

export function RestablecerForm() {
  const [datos, setDatos] = useState<DatosNuevaClave>({ clave: "", confirmar: "" });
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosNuevaClave, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAuth>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarNuevaClave(datos);
  const error = (campo: keyof DatosNuevaClave) =>
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
      // Si se guarda bien, la acción redirige al panel.
      setResultado(await restablecerClave(formData));
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div>
        <Campo
          etiqueta="Nueva contraseña"
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
        {pendiente ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
