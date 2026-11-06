import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = import.meta.dirname;
const run = (cmd, args) => spawnSync(join(root, "node_modules", ".bin", cmd), args, { cwd: root, encoding: "utf8" });
const version = (cmd) => run(cmd, ["--version"]).stdout.trim().replace(/^Version: /, "");

const oxlint = (file) =>
  JSON.parse(run("oxlint", ["-c", ".oxlintrc.json", "-f", "json", file]).stdout).diagnostics.map(
    (d) => `${d.labels[0]?.span.line}:${d.labels[0]?.span.column}`,
  );
const eslint = (file) =>
  JSON.parse(run("eslint", ["-f", "json", file]).stdout)[0].messages.map((m) =>
    m.fatal ? `fatal: ${m.message}` : `${m.line}:${m.column}`,
  );

const files = [
  "local-memo.jsx",
  "local-memo-component.jsx",
  "local-forward-ref.jsx",
  "react-memo-string.jsx",
  "react-memo.jsx",
];

console.log(`oxlint ${version("oxlint")}, eslint ${version("eslint")}`);
console.log(`"Component definition is missing display name" reports (line:column, "-" for none):\n`);
console.log(`${"file".padEnd(28)} ${"oxlint".padEnd(8)} eslint`);
for (const name of files) {
  const file = join("src", name);
  console.log(`${name.padEnd(28)} ${(oxlint(file).join(", ") || "-").padEnd(8)} ${eslint(file).join(", ") || "-"}`);
}
