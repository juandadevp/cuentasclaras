import type { AuthError } from "@supabase/supabase-js";

/** Traduce los errores de Supabase Auth a mensajes claros en español. */
export function traducirErrorAuth(error: Pick<AuthError, "code" | "message" | "status">): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Correo o contraseña incorrectos.";
    case "email_not_confirmed":
      return "Aún no has confirmado tu correo. Revisa tu bandeja de entrada (y el spam).";
    case "user_already_exists":
    case "email_exists":
      return "Este correo ya está registrado. Inicia sesión.";
    case "weak_password":
      return "La contraseña es demasiado débil. Usa una más segura.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    case "signup_disabled":
      return "El registro de nuevas cuentas está desactivado por ahora.";
    case "same_password":
      return "La nueva contraseña debe ser distinta de la anterior.";
    case "otp_expired":
      return "El enlace venció. Pide uno nuevo.";
    case "email_address_invalid":
      return "El correo no es válido o su dominio no está permitido.";
  }
  if (/invalid login credentials/i.test(error.message)) return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(error.message)) return traducirErrorAuth({ ...error, code: "email_not_confirmed" });
  if (/already registered/i.test(error.message)) return "Este correo ya está registrado. Inicia sesión.";
  if (/database error saving new user/i.test(error.message)) {
    return "No pudimos guardar tu perfil. Revisa que tus datos sean correctos e inténtalo de nuevo.";
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.";
}
