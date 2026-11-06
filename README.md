# oxlint repros

Each directory is a standalone reproduction for one oxlint issue, pinned to oxlint 1.91.0 (and ESLint 10.11.0 where it compares against ESLint). Run `pnpm install` and then the command in that directory's README.

| Directory | Issue |
| --- | --- |
| [`exhaustive-deps-plain-fix`](exhaustive-deps-plain-fix) | `react/exhaustive-deps` removes dependencies and comments under plain `--fix` |
| [`display-name-local-memo`](display-name-local-memo) | `react/display-name` treats any function named `memo` or `forwardRef` as React's |
| [`js-plugin-visitor-cost`](js-plugin-visitor-cost) | Any JS plugin visitor pays for deserializing and walking the whole AST |
