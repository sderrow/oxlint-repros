import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = import.meta.dirname;
const run = (cmd, args) => spawnSync(join(root, "node_modules", ".bin", cmd), args, { cwd: root, encoding: "utf8" });
const version = (cmd) => run(cmd, ["--version"]).stdout.trim().replace(/^Version: /, "");

const oxlint = (file) =>
  JSON.parse(run("oxlint", ["-c", ".oxlintrc.json", "-f", "json", file]).stdout).diagnostics.map(
    (d) => `${d.labels[0]?.span.line}:${d.labels[0]?.span.column} ${d.message}`,
  );
const eslint = (file) =>
  JSON.parse(run("eslint", ["-f", "json", file]).stdout)[0].messages.map((m) => `${m.line}:${m.column} ${m.message}`);

console.log(`oxlint ${version("oxlint")}, eslint ${version("eslint")}\n`);
for (const file of ["src/local-memo.jsx", "src/react-memo.jsx"]) {
  console.log(file);
  for (const [name, lint] of [["oxlint", oxlint], ["eslint", eslint]]) {
    const reports = lint(file);
    console.log(`  ${name}: ${reports.length ? reports.join("; ") : "no reports"}`);
  }
  console.log();
}
