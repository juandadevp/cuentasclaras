---
paths:
  - "src/app/**/actions.ts"
  - "src/lib/**/*-servidor.ts"
---

# Reglas del backend (Server Actions y consultas a Supabase)

- Toda acción empieza con `"use server"` y **vuelve a validar en el servidor** lo que llega: las validaciones del navegador se pueden saltar.
- Antes de tocar datos se comprueba la sesión con `supabase.auth.getUser()`. Sin sesión, se devuelve el mensaje «Tu sesión expiró. Inicia sesión de nuevo.».
- El `user_id` sale de la sesión comprobada, **nunca del formulario**. La seguridad por filas es la segunda barrera, no la única.
- Se revisa `supabaseConfigurado()` y se devuelve `MENSAJE_SIN_CONFIGURAR` si faltan las claves.
- Los errores de la base de datos se traducen a mensajes claros en español (por ejemplo `mensajeDeErrorPresupuesto`); el usuario nunca ve el error crudo.
- Tras cambiar datos se llama a `revalidatePath("/panel", "layout")`.
- Los identificadores que llegan de fuera (como un `id`) se validan antes de usarlos en una consulta.
- Las consultas a Supabase van en `src/lib/*-servidor.ts` y devuelven `{ datos, error }`; la lógica pura (cálculos, validaciones) va aparte, sin importar Supabase, para poder probarla.
