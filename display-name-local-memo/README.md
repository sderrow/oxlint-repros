# react/display-name reports a local function named `memo`

`react/display-name` treats any call to a function named `memo` as `React.memo`, even when `memo` is a local variable that has nothing to do with React.

```sh
pnpm install
pnpm repro
```

Output:

```text
oxlint 1.91.0, eslint v10.11.0

src/local-memo.jsx
  oxlint: 5:9 Component definition is missing display name.
  eslint: no reports

src/react-memo.jsx
  oxlint: 3:14 Component definition is missing display name.
  eslint: 3:20 Component definition is missing display name
```

- `src/local-memo.jsx`: `memo` is a local variable, and its argument is a string. Oxlint reports a missing display name, and `eslint-plugin-react` reports nothing.
- `src/react-memo.jsx`: a real anonymous `React.memo` component. Both tools report it, which shows the ESLint rule is running.
