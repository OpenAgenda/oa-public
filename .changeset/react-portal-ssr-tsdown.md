---
'@openagenda/react-portal-ssr': minor
---

Build moves from tsup to tsdown: dual CJS/ESM output as `.cjs`/`.mjs` files with a wildcard `exports` map (`./server` and `./common` keep resolving) and an explicit `module` field.
