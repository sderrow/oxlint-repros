import { spawnSync } from "node:child_process";
import { availableParallelism, cpus } from "node:os";
import { join } from "node:path";
import { ensureFixtures, fixtures } from "./gen.mjs";

const root = import.meta.dirname;
const oxlint = join(root, "node_modules", "oxlint", "bin", "oxlint");
const RUNS = Number(process.env.RUNS ?? 5);
const FILES = 2000;

ensureFixtures();

const lintOnce = (rule, dir) => {
  const start = performance.now();
  const { stdout, status } = spawnSync(
    process.execPath,
    [oxlint, "-c", `${rule}.oxlintrc.json`, "--disable-nested-config", "-f", "json", join(fixtures, dir)],
    { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 },
  );
  const seconds = (performance.now() - start) / 1000;
  const files = JSON.parse(stdout).number_of_files;
  if (status !== 0 || files !== FILES) throw new Error(`${rule} ${dir}: exit ${status}, ${files} files`);
  return seconds;
};

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const version = spawnSync(process.execPath, [oxlint, "--version"], { encoding: "utf8" }).stdout.trim();
console.log(`oxlint ${version.replace(/^Version: /, "")}, Node ${process.version}, ${process.platform} ${process.arch}, ${availableParallelism()} threads (${cpus()[0].model})`);
console.log(`Median of ${RUNS} runs, interleaved, after one warm-up run each.\n`);

const cases = [];
for (const dir of ["small", "large"]) for (const rule of ["no-visitors", "program-only"]) cases.push({ dir, rule, times: [] });
for (const c of cases) lintOnce(c.rule, c.dir);
for (let i = 0; i < RUNS; i++) for (const c of cases) c.times.push(lintOnce(c.rule, c.dir));

const time = (dir, rule) => median(cases.find((c) => c.dir === dir && c.rule === rule).times);
console.log("| Files | `no-visitors` | `program-only` | Added per file |");
console.log("| --- | --- | --- | --- |");
for (const [dir, label] of [["small", "2,000 one-line `.ts`"], ["large", "2,000 ~43 KB `.tsx`"]]) {
  const none = time(dir, "no-visitors");
  const program = time(dir, "program-only");
  console.log(`| ${label} | ${none.toFixed(2)}s | ${program.toFixed(2)}s | ${(((program - none) / FILES) * 1000).toFixed(2)}ms |`);
}
