# Plan 01-exportar-csv

## Contexto
La spec `docs/specs/01-exportar-csv/spec.md` pide un botón «Exportar CSV» en «Mis gastos» que descargue los gastos que la persona está viendo (mismo mes, búsqueda y categoría). Hoy no existe nada que genere CSV ni ningún Route Handler de descarga (lo confirmó el `explorador`). Toca backend (una ruta y lógica pura) y frontend (un enlace). Sin tablas nuevas, sin dependencias nuevas, sin IA.

## Decisiones técnicas
1. **La lógica va en una función pura** (`src/lib/exportar-csv.ts`), sin importar Supabase ni React, para probarla con `vitest` (criterios CA-1 a CA-7 y CA-9).
2. **Incluso las decisiones de la ruta son una función pura** (`codigoDeExportacion`): sin sesión → 401 (CA-8), error de base de datos → 500, lista recortada por el tope de 5.000 → 422 (CA-10), si no → 200. Así CA-8 y CA-10 también se prueban sin simular Supabase.
3. **La ruta es un Route Handler delgado** en `src/app/panel/gastos/exportar/route.ts`, bajo `/panel`, que el proxy ya protege (redirige a `/login` si no hay sesión). Copia el flujo de `Gastos.tsx`: `leerFiltros` → `rangoDelMes` → `gastosFiltrados`. La seguridad por filas hace que solo lleguen los gastos de la propia persona.
4. **Inyección en CSV:** a los textos libres (descripción y tienda) que empiezan por `=`, `+`, `-`, `@`, tabulador o retorno de carro se les antepone `'`. El monto es un número y no se toca.
5. **Excel:** marca BOM `﻿` al inicio, saltos `\r\n`, separador coma.
6. **El nombre del archivo se construye con un mes ya validado** (`yyyy-mm` o `todos`), nunca con texto de la URL, para no permitir caracteres raros en la cabecera `Content-Disposition`.
7. **El botón es un `<a download>` normal** (no `Link` de Next, que precargaría la descarga).

## Lo que ya existe y se reutiliza
- `src/lib/gastos.ts`: `leerFiltros`, `rangoDelMes`, `hoyIso`, `etiquetaCategoria`.
- `src/lib/gastos-servidor.ts`: `gastosFiltrados(supabase, inicio, fin, { q, categoria })` → `{ gastos, error, recortado }`.
- `src/lib/gastos-errores.ts`: `mensajeDeErrorGasto`.
- `src/lib/supabase/usuario.ts`: `obtenerUsuario()`. `src/lib/supabase/servidor.ts`: `crearClienteServidor()`. `src/lib/supabase/config.ts`: `supabaseConfigurado()`.
- `src/components/panel/Gastos.tsx`: barra de botones (`boton`, `enlaceMes`) donde va el enlace.

## Archivos
**Crear**
1. `src/lib/exportar-csv.ts`: `escaparCampoCsv(valor)`, `gastosACsv(gastos)`, `nombreArchivoCsv(mes)` (recibe `yyyy-mm` o `todos`), `enlaceExportarCsv(filtros, mes)` y `codigoDeExportacion({ haySesion, hayError, recortado })`.
2. `src/lib/exportar-csv.test.ts`: pruebas escritas **antes** del código por el `probador`.
3. `src/app/panel/gastos/exportar/route.ts`: `GET` delgado que usa lo anterior.

**Modificar**
- `src/components/panel/Gastos.tsx`: enlace «Exportar CSV» con `enlaceExportarCsv(filtros, mes)` en la barra de botones.
- `README.md`: fila de la spec en la tabla de pull requests, y `docs/specs/01-exportar-csv/` con `plan.md` y `tasks.md`.

## Criterios de aceptación → pruebas
| Criterio | Prueba o comprobación |
|---|---|
| CA-1 | `exportar-csv.test.ts` → encabezados y una fila por gasto, en orden |
| CA-2 | `exportar-csv.test.ts` → comas, comillas y saltos de línea entre comillas |
| CA-3 | `exportar-csv.test.ts` → prefijo `'` en `=`, `+`, `-`, `@` |
| CA-4 | `exportar-csv.test.ts` → etiqueta de categoría, fecha y monto sin miles |
| CA-5 | `exportar-csv.test.ts` → lista vacía = solo encabezados |
| CA-6 | `exportar-csv.test.ts` → BOM al inicio y `\r\n` |
| CA-7 | `exportar-csv.test.ts` → `gastos-2026-10.csv` y `gastos-todos.csv` |
| CA-8 | `exportar-csv.test.ts` → `codigoDeExportacion` sin sesión = 401 y primero que cualquier otro estado |
| CA-9 | `exportar-csv.test.ts` → `enlaceExportarCsv` con y sin filtros; y comprobación manual del botón en pantalla |
| CA-10 | `exportar-csv.test.ts` → `codigoDeExportacion` con `recortado` = 422 |

## Riesgos
- **Inyección en CSV:** cubierta por CA-3; el revisor de seguridad lo vuelve a mirar.
- **El Route Handler y `cacheComponents`:** en Next 16 hay que comprobar con `npm run build` que la ruta quede dinámica (depende de cookies y parámetros). Se consulta `node_modules/next/dist/docs/` antes de escribirla.
- **La ruta no tiene prueba automática propia** (solo su lógica pura): el paso a paso con una sesión real queda para la comprobación manual.
- **El hook de los agentes** se usa por primera vez de verdad con el `probador` y el `implementador`: si no lee bien la ruta del archivo, se ajusta y se anota en el README.

## Cómo se verifica
`npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, `node --test ".claude/hooks/*.test.mjs"` y `npm run build`. En pantalla: «Mis gastos» → «Exportar CSV» descarga `gastos-AAAA-MM.csv`, se abre en Excel con tildes y sin fórmulas ejecutadas, y sin sesión la ruta redirige a `/login`.
