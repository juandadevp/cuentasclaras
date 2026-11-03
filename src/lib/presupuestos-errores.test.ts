import { describe, expect, it } from "vitest";
import { mensajeDeErrorPresupuesto } from "@/lib/presupuestos-errores";

describe("mensajeDeErrorPresupuesto", () => {
  it.each(["42P01", "PGRST205"])("pide ejecutar la migración cuando falta la tabla (%s)", (code) => {
    expect(mensajeDeErrorPresupuesto({ code })).toBe(
      "Falta crear la tabla de presupuestos. Ejecuta la migración «presupuestos» en el SQL Editor de Supabase.",
    );
  });

  it("explica que los datos no cumplen las reglas", () => {
    expect(mensajeDeErrorPresupuesto({ code: "23514" })).toContain("no cumplen las reglas");
  });

  it("avisa cuando no hay permiso", () => {
    expect(mensajeDeErrorPresupuesto({ code: "42501" })).toContain("No tienes permiso");
  });

  it("no muestra el texto crudo del error en los casos desconocidos", () => {
    const mensaje = mensajeDeErrorPresupuesto({ code: "XX999", message: 'violates "secreto"' });
    expect(mensaje).toBe("No pudimos completar la operación con tus presupuestos. Inténtalo de nuevo.");
    expect(mensaje).not.toContain("secreto");
  });
});
