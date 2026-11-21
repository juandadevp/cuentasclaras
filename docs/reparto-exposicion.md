# Reparto de la exposición entre los tres

Son 17 diapositivas y 15 minutos de exposición (más 5 de preguntas). Cada uno habla unos 5 minutos y muestra en el código **lo mismo que cuenta**, para que nadie tenga que explicar algo que no tocó. Es una propuesta: cámbienla si alguno domina más otra parte.

| Quién | Diapositivas | Tiempo | Qué cuenta | Qué abre en el código (de `guia-archivos-exposicion.md`) |
|---|---|---|---|---|
| **Juan David** | 1 a 8 | 7 min (versión corta; 11 completa) | El proyecto, la aplicación, cómo está organizada, las tecnologías, el arnés, las siete skills y el proceso. | Archivos 1 a 6 (el guion completo está en `Guion_Juan_David.docx`): `README.md`, `AGENTS.md`, `.claude/rules/pruebas.md`, la skill `crear-migracion-supabase`, `settings.json` y `proteger-secretos.mjs`. |
| **Cristian** | 9 a 11 | 4 min | Los seis agentes, cómo se construye cada spec y qué cambió respecto del taller. | Archivos 7 a 10: `probador.md`, `implementador.md`, `limitar-agente.mjs` con sus pruebas, y `nueva-spec.md`. |
| **Jorge** | 12 a 17 | 6 min | Las cinco specs, lo que falló, la calidad, las conclusiones y el cierre. | Archivos 11 a 20: la carpeta `docs/specs/05-resumen-anual/`, el historial de `git log`, `resumen-anual.test.ts` → `resumen-anual.ts`, `ci.yml` y la revisión de la spec 01. |

## Cómo se reparten los dos guiones
- **`guion-exposicion.md`** (lo que se dice): cada uno lee solo sus bloques.
  - Juan David: bloques 1 y 2 («De dónde partimos» y «El arnés»).
  - Cristian: bloque 3 («Los agentes») y los pasos 1 a 3 del bloque 4.
  - Jorge: los pasos 4 a 9 del bloque 4, y los bloques 5 y 6.
- **`guia-archivos-exposicion.md`** (qué abrir): cada uno usa solo los archivos de su fila de la tabla de arriba.

## Cómo pasar de uno a otro
- Cada uno cierra con una frase que le da la palabra al siguiente. Ejemplos:
  - Juan David: «Ya vieron lo que rodea a la IA; ahora Cristian cuenta quién trabaja dentro de ese arnés».
  - Cristian: «Con los agentes definidos, Jorge muestra lo que construimos con ellos».
- La diapositiva 2 («Quién soy») hoy solo dice Juan David. Cada uno se presenta en 20 segundos ahí (Juan David abre). Si quieres, te la cambio para que salgan los tres nombres.

## Las preguntas (5 min)
Contesta quien tenga esa parte:
- Arnés, reglas, skills, memoria → Juan David.
- Agentes, hooks, flujo de la spec → Cristian.
- Pruebas, revisores, CI, fallos, límites → Jorge.
- Las preguntas generales («¿qué harían distinto?») las responde quien las tome primero, y los otros añaden un detalle.

## Antes de exponer, ensayen una vez entera
Con cronómetro y con el código abierto. Lo que más se traba es el cambio de persona frente al teclado, así que quien comparte pantalla debe ser siempre el mismo y los otros le dicen qué archivo abrir. Como Jorge abre la parte más larga del código (la spec 05), conviene que él ensaye mucho los pasos 9 y 10 de la guía y que tenga el repositorio abierto en `main` desde el principio.
