import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Cosmetic only — apostrophes/quotes in JSX text render fine. Escaping
      // every quote across text-heavy legal/UI pages adds noise, not safety.
      "react/no-unescaped-entities": "off",
      // Advisory, not correctness/security. This codebase intentionally types
      // Supabase query responses as `any` and calls loader fns inside effects.
      // Keep them visible as warnings without blocking CI.
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy static-site files not part of the Next.js app:
    "game.js",
    "nav-auth.js",
    "scripts/**",
  ]),
]);

export default eslintConfig;
