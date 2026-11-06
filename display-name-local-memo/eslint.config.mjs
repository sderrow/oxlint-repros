import react from "eslint-plugin-react";

export default [
  {
    files: ["**/*.jsx"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react },
    settings: { react: { version: "19" } },
    rules: { "react/display-name": "error" },
  },
];
