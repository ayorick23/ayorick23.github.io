import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { violation } from "../../.claude/hooks/guardia-git.mjs";

const HOOK = fileURLToPath(new URL("../../.claude/hooks/guardia-git.mjs", import.meta.url));

describe("guardia-git: violation()", () => {
  it.each([
    ['git commit -m "x"', "main"],
    ["git merge feat/x", "main"],
    ["git add . && git commit -m x", "main"],
    ["git push", "main"],
    ["git push origin", "main"],
  ])("bloquea %s en main", (command, branch) => {
    expect(violation(command, branch)).toMatch(/main/);
  });

  it.each(["git push origin main", "git push origin HEAD:main", "git push origin +feat/x:refs/heads/main"])(
    "bloquea push a main desde cualquier rama: %s",
    (command) => {
      expect(violation(command, "feat/x")).not.toBeNull();
    },
  );

  it.each(["git commit --no-verify -m x", "git commit -n -m x", "git push --no-verify"])(
    "bloquea saltear hooks: %s",
    (command) => {
      expect(violation(command, "feat/x")).toMatch(/no-verify/);
    },
  );

  it.each([
    ['git commit -m "x\n\nCo-Authored-By: Claude <noreply@anthropic.com>"', "feat/x"],
    ["git push -u origin feat/x", "feat/x"],
    ["git push", "feat/x"],
    ["git switch -c feat/y", "main"],
    ["git pull", "main"],
    ["git status && git log --oneline -5", "main"],
    ["git commit --amend --no-edit", "feat/x"],
  ])("permite %s (rama %s)", (command, branch) => {
    expect(violation(command, branch)).toBeNull();
  });

  it("si no se puede leer la rama, solo aplica las reglas que no dependen de ella", () => {
    expect(violation('git commit -m "x"', null)).toBeNull();
    expect(violation("git push origin main", null)).not.toBeNull();
  });
});

describe("guardia-git: proceso", () => {
  const run = (payload: string) => spawnSync(process.execPath, [HOOK], { input: payload, encoding: "utf8" });

  it("sale con 2 y explica el motivo cuando bloquea", () => {
    const result = run(JSON.stringify({ tool_input: { command: "git push origin main" } }));
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/guardia-git/);
  });

  it("sale con 0 en comandos que no son de git o con JSON inválido", () => {
    expect(run(JSON.stringify({ tool_input: { command: "npm test" } })).status).toBe(0);
    expect(run("no es json").status).toBe(0);
  });
});
