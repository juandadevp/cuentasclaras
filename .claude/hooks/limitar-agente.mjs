// Hook PreToolUse de los subagentes que escriben (probador e implementador).
// El campo `tools` de un agente solo dice QUÉ herramientas tiene; no dice sobre qué carpetas ni con qué comandos.
// Este hook lo completa: se ejecuta solo mientras ese agente está activo (ver `hooks:` en su archivo de .claude/agents/).
// Uso: node limitar-agente.mjs <probador|implementador>
// Si termina con código 2, la acción se cancela y el motivo le llega al agente.

import { existsSync } from "node:fs";
import path from "node:path";

const rol = process.argv[2];

let texto = "";
process.stdin.setEncoding("utf8");
for await (const trozo of process.stdin) texto += trozo;

let entrada;
try {
  entrada = JSON.parse(texto);
} catch {
  console.error("Bloqueado por el arnés: el hook del agente no pudo leer la acción.");
  process.exit(2); // sin poder revisar, no se deja pasar
}

const herramienta = String(entrada.tool_name ?? "");
const datos = entrada.tool_input ?? {};
const raiz = path.resolve(process.env.CLAUDE_PROJECT_DIR ?? entrada.cwd ?? process.cwd());

const bloquear = (motivo) => {
  console.error(`Bloqueado por el arnés (agente ${rol}): ${motivo}`);
  process.exit(2);
};

if (!["probador", "implementador"].includes(rol)) bloquear("rol desconocido en el hook.");

// ---------- Escritura de archivos: solo en las carpetas de su rol ----------
const herramientasDeEscritura = ["Edit", "Write", "MultiEdit", "NotebookEdit"];

if (herramientasDeEscritura.includes(herramienta)) {
  const dada = String(datos.file_path ?? datos.notebook_path ?? datos.path ?? "");
  if (!dada) bloquear("no se pudo saber qué archivo se quiere modificar.");

  const absoluta = path.resolve(raiz, dada);
  const relativa = path.relative(raiz, absoluta).split(path.sep).join("/");
  if (relativa.startsWith("../") || relativa === "..") bloquear("solo puede escribir dentro del proyecto.");

  const esPrueba = /\.test\.ts$/.test(relativa);

  if (rol === "probador") {
    if (!esPrueba) bloquear(`solo escribe archivos *.test.ts, no "${relativa}". El código de producción es del implementador.`);
  } else {
    // implementador
    if (esPrueba) bloquear(`no toca las pruebas ("${relativa}"): son del probador. Si una prueba parece incorrecta, repórtalo.`);
    const enSrc = relativa.startsWith("src/");
    const enMigraciones = relativa.startsWith("supabase/migrations/");
    if (!enSrc && !enMigraciones) bloquear(`solo escribe en src/** y en migraciones nuevas, no en "${relativa}".`);
    if (enMigraciones && existsSync(absoluta)) bloquear(`no modifica una migración que ya existe ("${relativa}"): crea una nueva.`);
  }
  process.exit(0);
}

// ---------- Comandos: solo los de su rol ----------
if (herramienta === "Bash") {
  const comando = String(datos.command ?? "").trim();
  // Nada de encadenar comandos, redirigir salidas ni sustituir comandos: así el permiso no se puede esquivar.
  if (/[;&|`<>]|\$\(|\n/.test(comando)) bloquear("no se encadenan comandos ni se redirigen salidas.");

  // Las pruebas se ejecutan sin banderas (como --config, que podría cargar otro código): solo archivos *.test.ts.
  const archivoDePrueba = String.raw`[\w./-]+\.test\.ts`;
  const soloPruebas = [
    /^npm test$/,
    new RegExp(`^npm test -- (${archivoDePrueba})( ${archivoDePrueba})*$`),
    /^npx vitest run$/,
    new RegExp(`^npx vitest run (${archivoDePrueba})( ${archivoDePrueba})*$`),
  ];
  const verificaciones = [/^npm run lint$/, /^npx next typegen$/, /^npx tsc --noEmit$/, /^npm run build$/];

  const permitidos = rol === "probador" ? soloPruebas : [...soloPruebas, ...verificaciones];
  if (!permitidos.some((patron) => patron.test(comando))) {
    bloquear(
      rol === "probador"
        ? `solo ejecuta las pruebas (npm test o npx vitest run, con archivos *.test.ts y sin banderas), no "${comando}".`
        : `solo ejecuta pruebas, lint, tipos y build, no "${comando}".`,
    );
  }
  process.exit(0);
}

process.exit(0);
