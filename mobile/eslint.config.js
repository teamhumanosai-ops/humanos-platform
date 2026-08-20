const eslint = require("@eslint/js");

module.exports = [
  {
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
      },
    },
  },
  eslint.configs.recommended,
  {
    ignores: [".expo/**", "dist/**", "node_modules/**"],
  },
];
