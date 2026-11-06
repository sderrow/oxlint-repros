# A JS plugin rule that only visits `Program` still pays for the whole AST

`plugin.mjs` has two rules that do nothing:

- `bench/no-visitors`: `create: () => ({})`
- `bench/program-only`: `create: () => ({ Program() {} })`

`gen.mjs` writes 2,000 one-line `.ts` files and 2,000 synthetic React `.tsx` files of about 43 KB each to `oxlint-program-only-fixtures` in the system temp directory, outside the repo because oxlint skips gitignored directories. The other scripts generate them if they're missing.

```sh
pnpm install
pnpm bench         # timing table
pnpm cpu-profile   # CPU profile of the JS thread, grouped by function prefix
```

`RUNS=10 pnpm bench` takes more samples.

Output:

```text
oxlint 1.91.0, Node v24.21.0, darwin arm64, 10 threads (Apple M5)
Median of 7 runs, interleaved, after one warm-up run each.

| Files | `no-visitors` | `program-only` | Added per file |
| --- | --- | --- | --- |
| 2,000 one-line `.ts` | 0.19s | 0.14s | -0.02ms |
| 2,000 ~43 KB `.tsx` | 0.25s | 1.57s | 0.66ms |

Self time on the JS thread, program-only rule on the large files (1.24s busy):
  walk*           54%  0.66s
  deserialize*    38%  0.47s
  GC               5%  0.07s
  other JS         3%  0.03s
```

`no-visitors` barely changes between small and large files. `program-only` grows with file size, and the profile shows nearly all of that time is spent deserializing and walking nodes the rule never visits.
