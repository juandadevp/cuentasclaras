import { validarEmail, validarNombre } from "@/lib/validaciones";

export const asuntosContacto = [
  { valor: "consulta", etiqueta: "Consulta general" },
  { valor: "problema", etiqueta: "Tengo un problema con la app" },
  { valor: "sugerencia", etiqueta: "Quiero hacer una sugerencia" },
  { valor: "otro", etiqueta: "Otro" },
] as const;

export interface DatosContacto {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;

export function validarContacto(d: DatosContacto): ErroresContacto {
  const errores: ErroresContacto = {};
  const nombre = validarNombre(d.nombre);
  if (nombre) errores.nombre = nombre;
  const email = validarEmail(d.email);
  if (email) errores.email = email;
  if (!asuntosContacto.some((a) => a.valor === d.asunto)) errores.asunto = "Elige un asunto.";
  const mensaje = d.mensaje.trim();
  if (mensaje.length < 10) errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  else if (mensaje.length > 1000) errores.mensaje = "El mensaje es demasiado largo (máximo 1000 caracteres).";
  return errores;
}
