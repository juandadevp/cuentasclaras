---
name: escribir-pruebas
description: Escribe pruebas automáticas con vitest para las funciones puras de Cuentas Claras (validaciones, cálculos, lectura de precios). Úsala cuando se agregue o cambie lógica en src/lib o cuando se pidan pruebas.
---

# Escribir pruebas con vitest

Una prueba es una frase que dice «si le doy esto, debe responder aquello». Si alguien cambia esa regla sin querer, la prueba falla y avisa.

## Dónde y cómo
- Junto al código: `src/lib/algo.ts` → `src/lib/algo.test.ts`.
- Se ejecutan con `npm test` (`vitest run`). La configuración está en `vitest.config.mts` y el atajo `@/` apunta a `src/`.
- GitHub Actions las corre en cada pull request.

## Qué probar
Lógica **pura** (recibe datos y devuelve un resultado, sin base de datos ni red):
- Validaciones (`validarClave`, `validarGasto`, `validarPresupuesto`…).
- Cálculos (`progresoPresupuesto`, totales por categoría).
- Lectura y normalización de datos (`parsearPrecio`, `parsearMonto`).

No pruebes componentes de Next ni llames a Supabase o a APIs reales.

## Forma de cada prueba
```ts
import { describe, expect, it } from "vitest";
import { funcion } from "@/lib/archivo";

describe("funcion", () => {
  it("acepta el caso correcto", () => {
    expect(funcion("ok")).toBeUndefined();
  });

  it.each([["a", 1], ["b", 2]])("entiende %s", (entrada, esperado) => {
    expect(funcion(entrada)).toBe(esperado);
  });
});
```

## Reglas
1. **Nombres en español**, que digan qué hace, no cómo («rechaza una contraseña sin mayúscula»).
2. Para cada función prueba: el caso feliz, **cada regla de rechazo** y los **bordes** (justo en el límite, vacío, `null`).
3. **Escribe el resultado esperado a partir de la regla**, no copiando lo que devuelve el código: si no, la prueba nunca falla.
4. Comprueba el mensaje exacto cuando el mensaje forme parte del comportamiento.
5. Evita `toBeTruthy()`: usa `toBe`, `toEqual` o `toBeNull`.
6. Las fechas de hoy se pasan como parámetro: no dependas del reloj.
7. No pruebes formatos que dependen del idioma del sistema (por ejemplo `toLocaleString`).

## Antes de terminar
Corre `npm test`, `npm run lint` y `npx tsc --noEmit`. Cuando cambies una regla, actualiza su prueba en el mismo commit.
