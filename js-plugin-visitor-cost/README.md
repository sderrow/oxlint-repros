# Any JS plugin visitor pays for deserializing and walking the whole AST

`plugin.mjs` has four rules that do nothing:

| Rule | Visitor |
| --- | --- |
| `bench/no-visitors` | `{}` |
| `bench/program-only` | `{ Program() {} }` |
| `bench/import-only` | `{ ImportDeclaration() {} }` |
| `bench/every-node` | `{ "*"() {} }` |

`gen.mjs` writes 2,000 one-line `.ts` files and 2,000 synthetic React `.tsx` files of about 43 KB each to `oxlint-js-plugin-fixtures` in the system temp directory, outside the repo because oxlint skips gitignored directories. The other scripts generate them if they're missing.

```sh
pnpm install
pnpm bench         # timing table, each rule enabled on its own
pnpm cpu-profile   # CPU profile of the JS thread for program-only, grouped by function prefix
```

`RUNS=10 pnpm bench` takes more samples.

Output:

```text
oxlint 1.91.0, Node v24.21.0, darwin arm64, 10 threads (Apple M5)
Median of 7 runs, interleaved, after one warm-up run each.

| Files | `no-visitors` | `program-only` | `import-only` | `every-node` |
| --- | --- | --- | --- | --- |
| 2,000 one-line `.ts` | 0.16s | 0.13s | 0.10s | 0.11s |
| 2,000 ~43 KB `.tsx` | 0.26s | 1.44s | 1.24s | 1.26s |

Self time on the JS thread, program-only rule on the large files (1.22s busy):
  walk*           56%  0.68s
  deserialize*    35%  0.43s
  GC               6%  0.08s
  other JS         3%  0.04s
```

A rule with no visitors costs the same on small and large files. Any other rule costs about 5x more on the large files, and it doesn't matter whether it visits one node, only imports, or every node. The profile shows where that time goes: walking and deserializing nodes the rule never looks at.

That matches [`lintFileImpl`](https://github.com/oxc-project/oxc/blob/3c856614467c1a79f5204c7ff1c3104fe489bda5/apps/oxlint/src-js/plugins/lint.ts#L264-L286): when every visitor is empty it skips the AST entirely, and otherwise it deserializes the whole AST (`initAst`) and walks every node (`walkProgram`).
