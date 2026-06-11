---
'@openagenda/eslint-config': major
---

Upgrade the linting toolchain:

- `@typescript-eslint/*` 5 → 8 (requires a recent ESLint 8 and TypeScript).
- New `eslint-plugin-unicorn` rules (`prefer-node-protocol`, `prefer-module`) and `eslint-import-resolver-typescript`.
- `airbnb` extends and the plugin list move from `recommended.js` into the base config; `ecmaVersion: 'latest'`; new override for `.cjs`/`.cts` files.
- Rewritten import resolver that handles both CommonJS and ESM (module type detection, `node:` builtin prefixes, separate resolver instances).
- Rule changes: `destructuredArrayIgnorePattern: '^_'`, `no-bitwise` with `int32Hint`, `import/no-import-module-exports`, `react/jsx-no-useless-fragment`; removed `arrow-parens`, `function-call-argument-newline` and the deprecated `jsx-a11y/label-has-for`.
