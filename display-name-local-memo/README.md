# react/display-name treats any function named `memo` or `forwardRef` as React's

`react/display-name` decides whether a call is `React.memo` or `React.forwardRef` by the callee's name alone. A local or third-party function called `memo` or `forwardRef` gets reported as an anonymous component, whatever it wraps.

```sh
pnpm install
pnpm repro
```

Output:

```text
oxlint 1.91.0, eslint v10.11.0
"Component definition is missing display name" reports (line:column, "-" for none):

file                         oxlint   eslint
local-memo.jsx               5:9      -
local-memo-component.jsx     3:14     -
local-forward-ref.jsx        3:14     -
react-memo-string.jsx        3:14     -
react-memo.jsx               3:14     3:20
```

| File | What it is |
| --- | --- |
| `src/local-memo.jsx` | A local `memo` helper called with strings (the case we hit) |
| `src/local-memo-component.jsx` | A local `memo` wrapping an arrow that returns JSX |
| `src/local-forward-ref.jsx` | A local `forwardRef` called with a string |
| `src/react-memo-string.jsx` | React's `memo` called with a string |
| `src/react-memo.jsx` | React's `memo` wrapping an anonymous arrow component (control: both tools report it) |

Oxlint: [`is_hoc_call`](https://github.com/oxc-project/oxc/blob/3c856614467c1a79f5204c7ff1c3104fe489bda5/crates/oxc_linter/src/utils/react.rs#L859-L869) matches `memo`, `forwardRef`, `React.memo` and `React.forwardRef` by name. For a `const x = …(…)` initializer, [`is_react_component_node`](https://github.com/oxc-project/oxc/blob/3c856614467c1a79f5204c7ff1c3104fe489bda5/crates/oxc_linter/src/rules/react/display_name.rs#L420-L455) then reports the call as an anonymous component unless the first argument is a named function or an identifier.

ESLint: [`isPragmaComponentWrapper`](https://github.com/jsx-eslint/eslint-plugin-react/blob/v7.37.5/lib/util/Components.js#L409-L427) only accepts a bare `memo` or `forwardRef` when it's imported from React (`isDestructuredFromPragmaImport`), and `React.memo` / `React.forwardRef` by object name.
