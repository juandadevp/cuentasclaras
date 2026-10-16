export interface DatosRegistro {
  nombre: string;
  email: string;
  telefono: string;
  clave: string;
  confirmar: string;
}

export type ErroresRegistro = Partial<Record<keyof DatosRegistro, string>>;

export const requisitosClave = [
  { id: "largo", texto: "Mínimo 8 caracteres", cumple: (v: string) => v.length >= 8 },
  { id: "mayuscula", texto: "Una letra mayúscula", cumple: (v: string) => /\p{Lu}/u.test(v) },
  { id: "minuscula", texto: "Una letra minúscula", cumple: (v: string) => /\p{Ll}/u.test(v) },
  { id: "numero", texto: "Un número", cumple: (v: string) => /\d/.test(v) },
];

/** Deja solo los dígitos de un teléfono, quitando el prefijo +57 / 57 si viene. */
export function soloDigitosTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 12 && digitos.startsWith("57") ? digitos.slice(2) : digitos;
}

export function validarNombre(valor: string): string | undefined {
  const nombre = valor.trim().replace(/\s+/g, " ");
  if (!nombre) return "Ingresa tu nombre completo.";
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(nombre)) return "Usa solo letras y espacios.";
  if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  if (nombre.split(" ").length < 2) return "Escribe tu nombre y tu apellido.";
  if (nombre.length > 80) return "El nombre es demasiado largo (máximo 80).";
}

export function validarEmail(valor: string): string | undefined {
  const email = valor.trim();
  if (!email) return "Ingresa tu correo electrónico.";
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Ingresa un correo válido, por ejemplo nombre@correo.com.";
  }
}

export function validarTelefono(valor: string): string | undefined {
  if (!valor.trim()) return "Ingresa tu número de celular.";
  if (/[^\d\s+()-]/.test(valor)) return "El teléfono solo puede tener números.";
  const digitos = soloDigitosTelefono(valor);
  if (digitos.length !== 10) return "El celular debe tener 10 dígitos.";
  if (!digitos.startsWith("3")) return "El celular debe empezar por 3.";
}

export function validarClave(valor: string): string | undefined {
  if (!valor) return "Crea una contraseña.";
  if (/\s/.test(valor)) return "La contraseña no puede tener espacios.";
  if (valor.length > 64) return "La contraseña es demasiado larga (máximo 64).";
  const falta = requisitosClave.find((r) => !r.cumple(valor));
  if (falta) return `La contraseña necesita: ${falta.texto.toLowerCase()}.`;
}

export function validarConfirmacion(clave: string, confirmar: string): string | undefined {
  if (!confirmar) return "Confirma tu contraseña.";
  if (confirmar !== clave) return "Las contraseñas no coinciden.";
}

export function validarRegistro(d: DatosRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {
    nombre: validarNombre(d.nombre),
    email: validarEmail(d.email),
    telefono: validarTelefono(d.telefono),
    clave: validarClave(d.clave),
    confirmar: validarConfirmacion(d.clave, d.confirmar),
  };
  for (const k of Object.keys(errores) as (keyof DatosRegistro)[]) {
    if (!errores[k]) delete errores[k];
  }
  return errores;
}
