import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables (especially imports that might be used later)
      "@typescript-eslint/no-unused-vars": "off",

      // Allow explicit any types
      "@typescript-eslint/no-explicit-any": "off",

      // Allow unused parameters (common in callbacks)
      "@typescript-eslint/no-unused-params": "off",

      // Allow console statements
      "no-console": "off",

      // Allow empty functions
      "@typescript-eslint/no-empty-function": "off",

      // Allow non-null assertions
      "@typescript-eslint/no-non-null-assertion": "off",

      // Allow unescaped entities in JSX (like apostrophes)
      "react/no-unescaped-entities": "off",

      // Allow unused expressions (like conditional expressions)
      "@typescript-eslint/no-unused-expressions": "off"
    }
  }
];

export default eslintConfig;
