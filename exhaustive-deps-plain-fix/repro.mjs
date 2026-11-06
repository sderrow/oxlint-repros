import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = import.meta.dirname;
const run = (cmd, args) => spawnSync(join(root, "node_modules", ".bin", cmd), args, { cwd: root, encoding: "utf8" });
const version = (cmd) => run(cmd, ["--version"]).stdout.trim().replace(/^Version: /, "");

const depArrays = (file) =>
  [...readFileSync(file, "utf8").matchAll(/\}, (\[[\s\S]*?\])\);/g)].map((m) => JSON.stringify(m[1]));

const copyOf = (name) => {
  const dir = mkdtempSync(join(root, "out", "run-"));
  cpSync(join(root, "src", name), join(dir, name));
  return join(dir, name);
};

const tools = {
  oxlint: {
    count: (file) => JSON.parse(run("oxlint", ["-c", ".oxlintrc.json", "-f", "json", file]).stdout).diagnostics.length,
    fix: (file) => run("oxlint", ["-c", ".oxlintrc.json", "--fix", file]),
  },
  eslint: {
    count: (file) => JSON.parse(run("eslint", ["-f", "json", file]).stdout)[0].messages.length,
    fix: (file) => run("eslint", ["--fix", file]),
  },
};

rmSync(join(root, "out"), { recursive: true, force: true });
mkdirSync(join(root, "out"));
console.log(`oxlint ${version("oxlint")}, eslint ${version("eslint")}\n`);

for (const [name, tool] of Object.entries(tools)) {
  const file = copyOf("single.jsx");
  const before = depArrays(file);
  const reported = tool.count(file);
  tool.fix(file);
  console.log(`single.jsx: ${name} reports ${reported} warnings. After one \`${name} --fix\`:`);
  depArrays(file).forEach((after, i) => console.log(`  ${before[i]}  ->  ${after}`));
  console.log();
}

const file = copyOf("several.jsx");
console.log(`several.jsx: oxlint reports ${tools.oxlint.count(file)} warnings. \`oxlint --fix\` until the file stops changing:`);
console.log(`  start   ${depArrays(file)[0]}`);
for (let i = 1; i <= 10; i++) {
  const before = readFileSync(file, "utf8");
  tools.oxlint.fix(file);
  if (readFileSync(file, "utf8") === before) break;
  console.log(`  run ${i}   ${depArrays(file)[0]}`);
}
