import { describe, expect, it } from "vitest";
import { mensajeDeErrorMeta } from "@/lib/metas-ahorro-errores";

describe("mensajeDeErrorMeta", () => {
  it.each(["42P01", "PGRST205"])("pide ejecutar la migración cuando falta la tabla (%s)", (code) => {
    const mensaje = mensajeDeErrorMeta({ code });
    expect(mensaje).toContain("metas_ahorro");
    expect(mensaje).toContain("migración");
  });

  it("explica que los datos no cumplen las reglas (23514)", () => {
    expect(mensajeDeErrorMeta({ code: "23514" })).toContain("reglas");
  });

  it("avisa de permiso o sesión (42501)", () => {
    expect(mensajeDeErrorMeta({ code: "42501" })).toMatch(/permiso|sesión/);
  });

  it("un código desconocido da un mensaje genérico no vacío", () => {
    const mensaje = mensajeDeErrorMeta({ code: "XX999" });
    expect(mensaje.trim().length).toBeGreaterThan(0);
    expect(mensaje).not.toContain("metas_ahorro");
  });

  it("un error vacío da un mensaje genérico no vacío", () => {
    expect(mensajeDeErrorMeta({}).trim().length).toBeGreaterThan(0);
  });

  it.each(["42P01", "PGRST205", "23514", "42501", "XX999", undefined])(
    "nunca muestra el message crudo (código %s)",
    (code) => {
      const mensaje = mensajeDeErrorMeta({ code, message: 'relation "metas_ahorro" secreto interno' });
      expect(mensaje).not.toContain("secreto");
      expect(mensaje).not.toContain("relation");
    },
  );
});
