// Security gate for CI: fails on any high/critical advisory in production dependencies
// unless it is listed in audit-allowlist.json with a reason and a review date. An expired
// entry fails too, so an exception can't silently become permanent.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BLOCKING = new Set(["high", "critical"]);
const allowlist = JSON.parse(readFileSync(new URL("../audit-allowlist.json", import.meta.url), "utf8"));
const today = new Date().toISOString().slice(0, 10);

let raw;
try {
  raw = execSync("npm audit --omit=dev --json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
} catch (err) {
  // npm audit exits non-zero whenever it finds anything; the JSON is still on stdout.
  raw = err.stdout;
}
const report = JSON.parse(raw);

const advisories = new Map();
for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via !== "object" || !BLOCKING.has(via.severity)) continue;
    const id = via.url?.split("/").pop() ?? String(via.source);
    advisories.set(id, { id, package: via.name, severity: via.severity, title: via.title, url: via.url });
  }
}

const failures = [];
for (const advisory of advisories.values()) {
  const entry = allowlist.find((a) => a.id === advisory.id);
  if (!entry)
    failures.push(`${advisory.severity.toUpperCase()} ${advisory.package}: ${advisory.title} (${advisory.url})`);
  else if (entry.reviewBy < today)
    failures.push(`Allowlist entry ${entry.id} (${entry.package}) expired on ${entry.reviewBy} — review it.`);
  else console.log(`Allowed until ${entry.reviewBy}: ${advisory.id} ${advisory.package} — ${entry.reason}`);
}

for (const entry of allowlist) {
  if (!advisories.has(entry.id))
    console.log(`Allowlist entry ${entry.id} (${entry.package}) no longer matches anything — remove it.`);
}

if (failures.length) {
  console.error(`\nBlocking advisories:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`\nAudit OK: ${advisories.size} high/critical advisories, all allowlisted.`);
