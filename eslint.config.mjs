import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Gitignored throwaway diagnostic / context-export / scratch scripts (not app code)
    "scripts/diagnostic*",
    "scripts/gen-profiles.ts",
    "scripts/debug-api-response.ts",
    "scripts/audit-live.ts",
    "scripts/clean-foreign-matches.ts",
    "scripts/verify-seed.ts",
    "export_*.js",
    "generate_handoff.js",
    "parse.js",
    "patch.js",
    "scratch-*",
  ]),
  {
    // eslint-plugin-react-hooks v6 ships React-Compiler rules that assume pure
    // functional components. This app is heavily React-Three-Fiber, which is
    // intentionally imperative: mutating geometry buffers / refs inside
    // useFrame, seeding particles with Math.random in useMemo, and driving
    // setState from animation + data-fetch effects. Those patterns are correct
    // here, so the compiler rules are disabled; the classic rules-of-hooks and
    // exhaustive-deps stay enabled.
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
