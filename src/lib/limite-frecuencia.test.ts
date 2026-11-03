import { describe, expect, it } from "vitest";
import { puedeIntentar } from "@/lib/limite-frecuencia";

const VENTANA = 60_000;

describe("puedeIntentar", () => {
  it("permite el primer intento", () => {
    expect(puedeIntentar(new Map(), "ana@correo.com", 1_000, VENTANA)).toBe(true);
  });

  it("bloquea un segundo intento dentro de la ventana", () => {
    const registro = new Map<string, number>();
    puedeIntentar(registro, "ana@correo.com", 1_000, VENTANA);
    expect(puedeIntentar(registro, "ana@correo.com", 1_000 + VENTANA - 1, VENTANA)).toBe(false);
  });

  it("permite de nuevo cuando pasa la ventana", () => {
    const registro = new Map<string, number>();
    puedeIntentar(registro, "ana@correo.com", 1_000, VENTANA);
    expect(puedeIntentar(registro, "ana@correo.com", 1_000 + VENTANA, VENTANA)).toBe(true);
  });

  it("un intento bloqueado no alarga la espera", () => {
    const registro = new Map<string, number>();
    puedeIntentar(registro, "ana@correo.com", 0, VENTANA);
    puedeIntentar(registro, "ana@correo.com", 30_000, VENTANA); // bloqueado
    expect(puedeIntentar(registro, "ana@correo.com", VENTANA, VENTANA)).toBe(true);
  });

  it("las claves distintas son independientes", () => {
    const registro = new Map<string, number>();
    puedeIntentar(registro, "ana@correo.com", 0, VENTANA);
    expect(puedeIntentar(registro, "luis@correo.com", 0, VENTANA)).toBe(true);
  });

  it("no crece más allá del máximo de entradas", () => {
    const registro = new Map<string, number>();
    for (let i = 0; i < 50; i++) puedeIntentar(registro, `u${i}@correo.com`, i, VENTANA, 10);
    expect(registro.size).toBeLessThanOrEqual(10);
  });

  it("al llenarse descarta primero las entradas vencidas", () => {
    const registro = new Map<string, number>();
    puedeIntentar(registro, "viejo@correo.com", 0, VENTANA, 2);
    puedeIntentar(registro, "reciente@correo.com", VENTANA, VENTANA, 2);
    puedeIntentar(registro, "nuevo@correo.com", VENTANA + 1, VENTANA, 2);
    expect([...registro.keys()].sort()).toEqual(["nuevo@correo.com", "reciente@correo.com"]);
  });
});
