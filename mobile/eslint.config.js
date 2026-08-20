const eslint = require("@eslint/js");

module.exports = [
  eslint.configs.recommended,
  {
    ignores: [".expo/**", "dist/**", "node_modules/**"],
  },
];
