import { defineConfig, type UserConfig } from 'tsdown';

// Builds the generated TS SDK to dist/ (ESM + d.ts). `ky` and `zod` stay
// external — they are real runtime dependencies of the package, not bundled in.
const config: UserConfig = defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'neutral',
  sourcemap: true,
  dts: true,
  // ky and zod are real runtime deps of the package — never bundle them in.
  deps: { neverBundle: ['ky', 'zod'] },
});

export default config;
