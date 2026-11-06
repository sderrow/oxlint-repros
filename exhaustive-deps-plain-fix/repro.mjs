import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = import.meta.dirname;
const run = (cmd, args) => spawnSync(join(root, "node_modules", ".bin", cmd), args, { cwd: root, encoding: "utf8" });
const version = (cmd) => run(cmd, ["--version"]).stdout.trim().replace(/^Version: /, "");

const dedent = (text) => {
  const lines = text.split("\n");
  const base = lines.at(-1).match(/^ */)[0].length;
  return lines.map((line, i) => (i === 0 ? line : line.slice(Math.min(base, line.match(/^ */)[0].length)))).join("\n");
};
const depArrays = (file) => [...readFileSync(file, "utf8").matchAll(/\}, (\[[\s\S]*?\])\);/g)].map((m) => dedent(m[1]));
const indent = (text) => text.replace(/^/gm, "    ");

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
console.log(`oxlint ${version("oxlint")}, eslint ${version("eslint")}`);

for (const [name, tool] of Object.entries(tools)) {
  const file = copyOf("single.jsx");
  const before = depArrays(file);
  const reported = tool.count(file);
  tool.fix(file);
  console.log(`\nsingle.jsx: ${name} reports ${reported} warnings. After one \`${name} --fix\`:`);
  depArrays(file).forEach((after, i) => console.log(`  ${before[i]}  ->  ${after}`));
}

const several = copyOf("several.jsx");
console.log(`\nseveral.jsx: oxlint reports ${tools.oxlint.count(several)} warnings. \`oxlint --fix\` until the file stops changing:`);
console.log(`  start:\n${indent(depArrays(several)[0])}`);
for (let i = 1; i <= 10; i++) {
  const before = readFileSync(several, "utf8");
  tools.oxlint.fix(several);
  if (readFileSync(several, "utf8") === before) break;
  console.log(`  run ${i}:\n${indent(depArrays(several)[0])}`);
}

const comment = copyOf("comment.jsx");
const commentBefore = depArrays(comment)[0];
console.log(`\ncomment.jsx: oxlint reports ${tools.oxlint.count(comment)} warning. After one \`oxlint --fix\`:`);
tools.oxlint.fix(comment);
console.log(`  before:\n${indent(commentBefore)}\n  after:\n${indent(depArrays(comment)[0])}`);
