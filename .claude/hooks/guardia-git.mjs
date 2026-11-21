// Hook PreToolUse de Claude Code: hace cumplir las reglas de git del CLAUDE.md (ADR 0014).
//
// El CLAUDE.md las pide; este hook las garantiza. Claude Code pasa por stdin el JSON de la
// llamada (Bash o PowerShell). Si el comando rompe una regla, sale con código 2: la llamada se
// bloquea y Claude ve el mensaje de stderr. Si no, sale con 0 y sigue el flujo normal de
// permisos (el hook nunca aprueba nada, solo puede bloquear).
//
// Reglas:
//   1. No commitear ni mergear estando en main.
//   2. No hacer push a main, ni un `git push` sin destino estando en main.
//   3. No saltear los hooks de git (--no-verify).
// En este repo la línea Co-Authored-By SÍ está permitida (a diferencia de otros proyectos).
//
// Límites conocidos: mira el texto del comando, y la rama se consulta antes de que corra
// (`git checkout main && git commit` no se detecta). Cubre lo que Claude escribe normalmente;
// no es una barrera contra alguien que intenta esquivarla.

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const PROTECTED = new Set(["main", "master"]);
const SEPARATORS = /&&|\|\||;|\||\n/;
const GIT = /(?:^|\s)git(?:\.exe)?\s+(?:-C\s+\S+\s+)?(\S+)(.*)$/s;

export function currentBranch(cwd) {
  try {
    // symbolic-ref y no rev-parse: funciona en una rama sin commits todavía.
    return execFileSync("git", ["symbolic-ref", "--short", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10_000,
    }).trim();
  } catch {
    return null;
  }
}

function pushesToProtected(args) {
  const targets = args.split(/\s+/).filter((a) => a && !a.startsWith("-"));
  return targets.slice(1).some((refspec) => {
    const dest = refspec.replace(/^\+/, "").split(":").pop().replace(/^refs\/heads\//, "");
    return PROTECTED.has(dest);
  });
}

/** Devuelve el motivo del bloqueo, o null si el comando cumple las reglas. */
export function violation(command, branch) {
  const onProtected = branch !== null && PROTECTED.has(branch);
  for (const segment of command.split(SEPARATORS)) {
    const match = GIT.exec(segment.trim());
    if (!match) continue;
    const [, sub, args] = match;

    if (/(?:^|\s)--no-verify(?:\s|$)/.test(args) || (sub === "commit" && /(?:^|\s)-\w*n\w*(?:\s|$)/.test(args))) {
      return "No se saltean los hooks de git (--no-verify): corrige lo que falla.";
    }
    if (onProtected && (sub === "commit" || sub === "merge")) {
      return `Estás en '${branch}': crea una rama feat/, fix/, chore/, test/ o docs/ antes de hacer ${sub}.`;
    }
    if (sub === "push") {
      if (pushesToProtected(args)) {
        return "No se hace push a main: sube la rama y el merge lo hace Dereck en GitHub.";
      }
      const positional = args.split(/\s+/).filter((a) => a && !a.startsWith("-"));
      if (onProtected && positional.length < 2) {
        return `Estás en '${branch}': un push sin destino iría a main. Cambia a la rama de trabajo.`;
      }
    }
  }
  return null;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const command = payload?.tool_input?.command;
  if (typeof command !== "string" || !/\bgit\b/.test(command)) process.exit(0);

  const reason = violation(command, currentBranch(payload.cwd || process.cwd()));
  if (reason) {
    process.stderr.write(`guardia-git: ${reason}\n`);
    process.exit(2);
  }
  process.exit(0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
