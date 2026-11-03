import type { DatosContacto, ErroresContacto } from "@/lib/contacto-tipos";
import { validarEmail } from "@/lib/validaciones";

export const asuntosContacto = [
  { valor: "consulta", etiqueta: "Consulta general" },
  { valor: "problema", etiqueta: "Tengo un problema con la app" },
  { valor: "sugerencia", etiqueta: "Quiero hacer una sugerencia" },
  { valor: "otro", etiqueta: "Otro" },
] as const;

/** Mismos límites que los `check` de la tabla `mensajes_contacto`. */
export const LIMITES_CONTACTO = {
  nombre: { min: 3, max: 80 },
  correo: { min: 5, max: 120 },
  mensaje: { min: 10, max: 1000 },
};

const NOMBRE_VALIDO = /^[\p{L}][\p{L}\s'.-]*$/u;
// Caracteres de control salvo tabulador y salto de línea. PostgreSQL rechaza el nulo.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function esAsunto(valor: string): boolean {
  return asuntosContacto.some((a) => a.valor === valor);
}

function nombreSinEspaciosDobles(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

/** Deja los datos listos para validar y guardar: sin espacios sobrantes ni caracteres de control. */
export function normalizarContacto(d: DatosContacto): DatosContacto {
  return {
    nombre: nombreSinEspaciosDobles(d.nombre.replace(CONTROL, "")),
    correo: d.correo.replace(CONTROL, "").trim().toLowerCase(),
    asunto: d.asunto,
    mensaje: d.mensaje.replace(CONTROL, "").trim(),
  };
}

/** Se usa igual en el navegador y en el servidor. Devuelve un objeto vacío si todo está bien. */
export function validarContacto(d: DatosContacto): ErroresContacto {
  const errores: ErroresContacto = {};

  const nombre = nombreSinEspaciosDobles(d.nombre);
  if (!nombre) errores.nombre = "Ingresa tu nombre.";
  else if (!NOMBRE_VALIDO.test(nombre)) errores.nombre = "Usa solo letras y espacios.";
  else if (nombre.length < LIMITES_CONTACTO.nombre.min) errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  else if (nombre.length > LIMITES_CONTACTO.nombre.max) errores.nombre = "El nombre es demasiado largo (máximo 80).";

  const correo = validarEmail(d.correo);
  if (correo) errores.correo = correo;

  if (!esAsunto(d.asunto)) errores.asunto = "Elige un asunto.";

  const mensaje = d.mensaje.trim();
  if (mensaje.length < LIMITES_CONTACTO.mensaje.min) errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  else if (mensaje.length > LIMITES_CONTACTO.mensaje.max) errores.mensaje = "El mensaje es demasiado largo (máximo 1000 caracteres).";

  return errores;
}
