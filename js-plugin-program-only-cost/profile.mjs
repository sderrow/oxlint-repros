import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ensureFixtures, fixtures } from "./gen.mjs";

const root = import.meta.dirname;
const oxlint = join(root, "node_modules", "oxlint", "bin", "oxlint");
const profDir = join(root, "prof");

ensureFixtures();
rmSync(profDir, { recursive: true, force: true });
spawnSync(
  process.execPath,
  ["--cpu-prof", `--cpu-prof-dir=${profDir}`, oxlint, "-c", "program-only.oxlintrc.json", "--disable-nested-config", "-f", "json", join(fixtures, "large")],
  { cwd: root, stdio: "ignore" },
);

const category = (fn) => {
  if (fn.startsWith("deserialize")) return "deserialize*";
  if (fn.startsWith("walk")) return "walk*";
  if (fn === "(garbage collector)") return "GC";
  if (fn === "(idle)" || fn === "(program)" || fn === "(root)") return null;
  return "other JS";
};

const totals = new Map();
for (const file of readdirSync(profDir)) {
  const profile = JSON.parse(readFileSync(join(profDir, file), "utf8"));
  const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
  profile.samples.forEach((id, i) => {
    const key = category(nodes.get(id).callFrame.functionName || "(anonymous)");
    if (key) totals.set(key, (totals.get(key) ?? 0) + profile.timeDeltas[i] / 1000);
  });
}
const busy = [...totals.values()].reduce((a, b) => a + b, 0);
console.log(`Self time on the JS thread, program-only rule on the large files (${(busy / 1000).toFixed(2)}s busy):`);
for (const [key, ms] of [...totals].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${key.padEnd(14)} ${((ms / busy) * 100).toFixed(0).padStart(3)}%  ${(ms / 1000).toFixed(2)}s`);
}
