# oxlint repros

Each directory is a standalone reproduction for one oxlint issue, pinned to oxlint 1.91.0 (and ESLint 10.11.0 where it compares against ESLint). Run `pnpm install` and then the command in that directory's README.

| Directory | Issue |
| --- | --- |
| [`exhaustive-deps-plain-fix`](exhaustive-deps-plain-fix) | `react/exhaustive-deps` removes dependencies under plain `--fix` |
| [`display-name-local-memo`](display-name-local-memo) | `react/display-name` reports a local function named `memo` |
| [`js-plugin-program-only-cost`](js-plugin-program-only-cost) | A JS plugin rule that only visits `Program` still pays for the whole AST |
