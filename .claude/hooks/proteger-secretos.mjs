// Hook PreToolUse de Claude Code: bloquea lo que nunca debe hacer el agente.
// Claude Code le entrega por la entrada estándar un JSON con la herramienta y sus datos.
// Si el hook termina con código 2, la acción se cancela y el mensaje de error le llega al agente.

let texto = "";
process.stdin.setEncoding("utf8");
for await (const trozo of process.stdin) texto += trozo;

let entrada;
try {
  entrada = JSON.parse(texto);
} catch {
  process.exit(0); // sin datos que revisar: no se bloquea nada
}

const datos = entrada.tool_input ?? {};
const ruta = String(datos.file_path ?? datos.path ?? "");
const comandoCompleto = String(datos.command ?? "");

// El texto que se escribe en un archivo con `cat <<EOF ... EOF` no es un comando: se quita antes de revisar,
// para que un documento que *mencione* «git push --force» no se confunda con un push de verdad.
const comando = comandoCompleto.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n[ \t]*\2(?=\n|$)/g, "<<$2 [contenido omitido]");

// .env.local, .env.production, etc. (pero .env.example sí se puede leer y editar).
const esArchivoSecreto = (valor) => /(^|[\\/])\.env(\.(?!example\b)[\w.-]+)?$/.test(valor);
const mencionaSecreto = /(^|[\s"'=:\/\\])\.env(\.(?!example\b)[\w.-]+)?(?=$|[\s"';|&)])/.test(comando);

const reglas = [
  [esArchivoSecreto(ruta), "No se leen ni se editan los archivos .env (claves secretas). Usa .env.example como referencia."],
  [mencionaSecreto, "No se ejecutan comandos que lean o modifiquen archivos .env (claves secretas)."],
  [/\bgit\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/.test(comando), "No se hace git push forzado."],
  [/\bgit\s+push\b[^\n]*\s(origin\s+)?main\b/.test(comando), "No se sube directo a main: todo cambio va en una rama y llega por pull request."],
  [/\bgit\s+reset\s+--hard\b/.test(comando), "No se usa git reset --hard: borra trabajo sin guardar."],
  [/\brm\s+-[a-z]*r[a-z]*f?[a-z]*\s+(\/|~|\.\s|\.$|\*)/.test(comando), "No se borran carpetas completas con rm -rf sobre la raíz, el home o el directorio actual."],
];

const bloqueo = reglas.find(([coincide]) => coincide);
if (bloqueo) {
  console.error(`Bloqueado por el arnés del proyecto: ${bloqueo[1]}`);
  process.exit(2);
}
process.exit(0);
