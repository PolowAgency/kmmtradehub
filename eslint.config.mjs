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
      // Ces règles génèrent des faux positifs dans Next.js App Router
      // (les server components ne sont pas des hooks React)
      "react-hooks/purity": "off",
      // Apostrophes dans le JSX — désactivé car géré par l'encodage HTML
      "react/no-unescaped-entities": "off",
      // any est parfois nécessaire avec Supabase types génériques
      "@typescript-eslint/no-explicit-any": "warn",
      // Variables non utilisées : warning seulement
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      // Expressions non utilisées : warning
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
]);

export default eslintConfig;
