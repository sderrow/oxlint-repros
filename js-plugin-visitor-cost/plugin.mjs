export default {
  meta: { name: "bench" },
  rules: {
    "no-visitors": { create: () => ({}) },
    "program-only": { create: () => ({ Program() {} }) },
    "import-only": { create: () => ({ ImportDeclaration() {} }) },
    "every-node": { create: () => ({ "*"() {} }) },
  },
};
