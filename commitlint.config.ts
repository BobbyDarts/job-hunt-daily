export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [
      2,
      "always",
      ["lower-case", "sentence-case", "kebab-case", "camel-case"],
    ],
  },
};
