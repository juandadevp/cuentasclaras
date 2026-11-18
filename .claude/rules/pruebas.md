---
paths:
  - "src/**/*.test.ts"
---

# Reglas de las pruebas

- Las pruebas usan `vitest` y viven junto al código que prueban: `src/lib/ahorro.ts` → `src/lib/ahorro.test.ts`.
- Los nombres de `describe` e `it` van en español y dicen el comportamiento: «gastar exactamente el límite no cuenta como excedido».
- El resultado esperado se **calcula a mano** a partir del requisito (del criterio de aceptación). Nunca se copia de lo que devuelve el código: una prueba que repite al código no prueba nada.
- Cada prueba debe poder fallar por una razón concreta. Prohibido: pruebas sin aserción, que solo comprueban que «no lanza error», que verifican solo un doble de prueba, `it.skip` y `it.only`.
- Incluye siempre el caso límite (cero, vacío, justo en el borde, cruce de año) y el caso de error.
- Ninguna prueba llama a una API real ni a Supabase: se prueban funciones puras de `src/lib/`.
- Las pruebas se escriben **antes** que el código (Red), se confirma que fallan por el motivo esperado y se suben en su propio commit.
