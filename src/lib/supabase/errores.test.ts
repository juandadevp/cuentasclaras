import { describe, expect, it } from "vitest";
import { traducirErrorAuth } from "@/lib/supabase/errores";

const error = (code: string, message = "mensaje crudo de Supabase") => ({ code, message, status: 400 });

describe("traducirErrorAuth", () => {
  it("avisa que la nueva contraseña debe ser distinta de la anterior", () => {
    expect(traducirErrorAuth(error("same_password"))).toBe("La nueva contraseña debe ser distinta de la anterior.");
  });

  it.each(["otp_expired", "session_expired", "session_not_found", "refresh_token_not_found", "bad_jwt"])(
    "dice que el enlace venció (%s)",
    (code) => {
      expect(traducirErrorAuth(error(code))).toBe("El enlace venció. Pide uno nuevo.");
    },
  );

  it("pide un enlace nuevo cuando Supabase exige volver a autenticarse", () => {
    expect(traducirErrorAuth(error("reauthentication_needed"))).toContain("pide un enlace nuevo");
  });

  it.each(["over_request_rate_limit", "over_email_send_rate_limit"])("avisa de demasiados intentos (%s)", (code) => {
    expect(traducirErrorAuth(error(code))).toBe("Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
  });

  it("traduce las credenciales incorrectas y la contraseña débil", () => {
    expect(traducirErrorAuth(error("invalid_credentials"))).toBe("Correo o contraseña incorrectos.");
    expect(traducirErrorAuth(error("weak_password"))).toBe("La contraseña es demasiado débil. Usa una más segura.");
  });

  it("no deja pasar el texto crudo en los casos desconocidos", () => {
    const mensaje = traducirErrorAuth(error("algo_raro", "secreto interno"));
    expect(mensaje).toBe("Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.");
    expect(mensaje).not.toContain("secreto");
  });
});
