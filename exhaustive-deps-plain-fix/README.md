# react/exhaustive-deps removes dependencies under plain `--fix`

Plain `oxlint --fix` (no `--fix-suggestions` or `--fix-dangerously`) deletes entries from effect dependency arrays. `eslint-plugin-react-hooks` reports the same problems but only as suggestions, so `eslint --fix` leaves the file alone.

```sh
pnpm install
pnpm repro
```

`repro.mjs` copies each file in `src/` into `out/`, counts the warnings, runs the fixer, and prints every dependency array before and after.

Output:

```text
oxlint 1.91.0, eslint v10.11.0

single.jsx: oxlint reports 2 warnings. After one `oxlint --fix`:
  [section, ref.current]  ->  [section]
  [section, OUTER]  ->  [section]

single.jsx: eslint reports 2 warnings. After one `eslint --fix`:
  [section, ref.current]  ->  [section, ref.current]
  [section, OUTER]  ->  [section, OUTER]

several.jsx: oxlint reports 4 warnings. `oxlint --fix` until the file stops changing:
  start:
    [section, ref.current, other.current, OUTER, OTHER]
  run 1:
    [
    	section,
    	ref.current,
    	other.current,
    	OTHER
    ]
  run 2:
    [
    	section,
    	ref.current,
    	other.current
    ]
  run 3:
    [section, ref.current]
  run 4:
    [section]

comment.jsx: oxlint reports 1 warning. After one `oxlint --fix`:
  before:
    [
      section, // re-run when the tab changes
      page,
      OUTER,
    ]
  after:
    [section, page]
```

- `src/single.jsx`: one plain `--fix` run removes `ref.current` and the module constant `OUTER`. ESLint reports both and changes nothing.
- `src/several.jsx`: with four flagged entries in one array, each run removes only one. Runs 1 and 2 also reformat the array as tab-indented lines, and run 3 puts it back on one line.
- `src/comment.jsx`: removing `OUTER` also deletes the comment on `section`.

All three come from how the fix is built. [`remove_dependency`](https://github.com/oxc-project/oxc/blob/3c856614467c1a79f5204c7ff1c3104fe489bda5/crates/oxc_linter/src/rules/react/exhaustive_deps.rs#L1514-L1536) rebuilds the array without the entry, prints it with oxc's code generator, and replaces the whole array. So every fix in one array replaces the same span, the fixes overlap, and only one applies per run. The printed array follows the code generator's layout, not the source's, and comments inside it are lost.
