import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Faux positifs react-hooks v7 sur les Server/Client Components Next.js
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/no-deriving-state-in-effects": "off",
      // Apostrophes dans le JSX — géré par l'encodage HTML
      "react/no-unescaped-entities": "off",
      // any parfois nécessaire avec les types génériques Supabase
      "@typescript-eslint/no-explicit-any": "warn",
      // Variables non utilisées : warning uniquement
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
]);

export default eslintConfig;
