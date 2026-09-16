# @openagenda/date-utils

## 0.0.3

### Patch Changes

- [#282](https://github.com/OpenAgenda/oa/pull/282) [`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Jest from 29.7 to 30.4.2, along with `babel-jest`, `@jest/globals` and `jest-environment-jsdom` (30.4.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  Jest 30 supports `import.meta.filename` and `import.meta.dirname` natively, so the local patch these packages relied on (`jest-runtime@29.7.0`) is removed along with its `resolutions` entry.

- [#328](https://github.com/OpenAgenda/oa/pull/328) [`fae95e4`](https://github.com/OpenAgenda/oa/commit/fae95e4be12de83f709bfeb0793e5e05b62280dc) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Align on `date-fns-tz@^2` and import its members by name.

  Both packages were still on `date-fns-tz@^1.3.7` while the rest of the monorepo had moved to `^2`, and both reached for the library through a default import (`import dateFnsTz from 'date-fns-tz'` followed by destructuring). That works against the 1.x build, whose `exports` map offers CommonJS only, but 2.x adds an `import` condition pointing at an ESM build that has no default export — so the same specifier resolves to two incompatible shapes depending on which version wins.

  Nothing broke as long as each package kept its own nested copy, but a bundler that dedupes by bare specifier collapses them into one and the default import then resolves to the ESM build and fails. That is what took down the event stories under Vite.

  Named imports are correct against 2.x under both Node and any bundler, and both packages now request the same major as the rest of the monorepo. Copies still remain elsewhere in the tree — `react-filters` asks for `^2.0.1` and keeps its own — so this narrows the mismatch rather than dedupes the install outright.

## 0.0.2

### Patch Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Rebuild with tsdown: equivalent dual CJS/ESM output (`.cjs`/`.mjs`) with split `.d.mts`/`.d.cts` type declarations.
