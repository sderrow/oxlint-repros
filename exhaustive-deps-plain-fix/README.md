# react/exhaustive-deps removes dependencies under plain `--fix`

Plain `oxlint --fix` (no `--fix-suggestions` or `--fix-dangerously`) deletes entries from effect dependency arrays. `eslint-plugin-react-hooks` reports the same problems but only as suggestions, so `eslint --fix` leaves the file alone.

```sh
pnpm install
pnpm repro
```

`repro.mjs` copies each file in `src/` into `out/`, counts the warnings, runs the fixer, and prints every dependency array before and after (JSON-quoted so whitespace shows).

Output:

```text
oxlint 1.91.0, eslint v10.11.0

single.jsx: oxlint reports 2 warnings. After one `oxlint --fix`:
  "[section, ref.current]"  ->  "[section]"
  "[section, OUTER]"  ->  "[section]"

single.jsx: eslint reports 2 warnings. After one `eslint --fix`:
  "[section, ref.current]"  ->  "[section, ref.current]"
  "[section, OUTER]"  ->  "[section, OUTER]"

several.jsx: oxlint reports 4 warnings. `oxlint --fix` until the file stops changing:
  start   "[section, ref.current, other.current, OUTER, OTHER]"
  run 1   "[\n\tsection,\n\tref.current,\n\tother.current,\n\tOTHER\n]"
  run 2   "[\n\tsection,\n\tref.current,\n\tother.current\n]"
  run 3   "[section, ref.current]"
  run 4   "[section]"
```

- `src/single.jsx`: one plain `--fix` run removes `ref.current` and the module constant `OUTER`. ESLint reports both and changes nothing.
- `src/several.jsx`: with four flagged entries in one array, each run removes one, and runs 1 and 2 also rewrite the array as tab-indented lines.
