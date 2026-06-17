# @openagenda/react-portal-ssr

## 1.1.0

### Minor Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Build moves from tsup to tsdown: dual CJS/ESM output as `.cjs`/`.mjs` files with a wildcard `exports` map (`./server` and `./common` keep resolving) and an explicit `module` field.
