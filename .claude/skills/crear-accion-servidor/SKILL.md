---
name: crear-accion-servidor
description: Escribe una Server Action de Next.js para Cuentas Claras con validación en el servidor, comprobación de sesión, límite de uso y mensajes de error en español. Úsala cuando se pida guardar, editar, borrar o consultar datos desde un formulario o botón.
---

# Crear una acción de servidor

Una acción de servidor es una función que se ejecuta en el servidor cuando alguien envía un formulario. **El navegador no es de fiar**: todo se comprueba aquí.

## Plantilla
```ts
"use server";

export async function crearAlgo(formData: FormData): Promise<ResultadoAlgo> {
  // 1. Leer y normalizar
  // 2. Validar con la misma función que usa el formulario
  // 3. Comprobar configuración de Supabase
  // 4. Comprobar la sesión con getUser()
  // 5. (Opcional) limitar la frecuencia
  // 6. Guardar y traducir errores
}
```

## Reglas obligatorias
1. **Valida siempre en el servidor** con la función de `src/lib/validaciones-*.ts`, la misma que usa el cliente. Si falla, devuelve `{ errores: { campo: "mensaje" } }`.
2. **Comprueba la sesión** con `supabase.auth.getUser()`. Sin sesión: «Tu sesión expiró. Inicia sesión de nuevo.».
3. **Nunca confíes en un `user_id` que venga del formulario.** La tabla lo llena sola (`default auth.uid()`) y la seguridad por filas hace el resto.
4. **Comprueba `supabaseConfigurado()`** y devuelve `MENSAJE_SIN_CONFIGURAR` si falta.
5. **Traduce los errores de Supabase** a español, sin mostrar el texto crudo:
   - `42P01` o `PGRST205` → «Falta crear la tabla de X. Ejecuta la migración «x» en Supabase.»
   - `PGRST204` o una restricción `check` → «Falta actualizar la base de datos…»
   - `23505` (duplicado) → mensaje del caso concreto.
6. **Limita la frecuencia** en acciones costosas o públicas (mapa en memoria por usuario o por correo, por ejemplo una vez cada 1,5 segundos).
7. **Redirecciones** solo a rutas internas fijas.
8. Tras escribir datos, llama a `revalidatePath` de las rutas que los muestran.
9. Devuelve un tipo con forma fija (`{ ok?, errores?, mensaje? }`) para que el formulario sepa qué mostrar.

## Lo que no debes hacer
- No uses `any`. No dejes `console.log` con datos personales.
- No aceptes montos, categorías o fechas sin revisar su rango y su lista permitida.
- No pongas claves secretas en el código: solo en variables de entorno del servidor, sin el prefijo `NEXT_PUBLIC_`.

## Pruebas
La validación vive en `src/lib/` precisamente para poder probarla con la skill `escribir-pruebas`.
