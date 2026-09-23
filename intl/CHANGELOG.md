# @openagenda/intl

## 2.1.0

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

- [#329](https://github.com/OpenAgenda/oa/pull/329) [`5aafa09`](https://github.com/OpenAgenda/oa/commit/5aafa0995e9a91b4df187536c559610121dc8c44) Thanks [@kaore](https://github.com/kaore)! - Add `getSortCollator(locale, fallbackLocale)`: the cached `Intl.Collator` used everywhere OpenAgenda sorts user-facing labels alphabetically (`sensitivity: 'base'`, `numeric: true`, `usage: 'sort'`), falling back through `fallbackLocale` to the host default on an unknown or malformed tag. One shared construction site so `@openagenda/form-schemas` and `@openagenda/react-filters` cannot drift apart and show the same option set in two different orders.

## 2.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The package is now `"type": "module"`: the CLI scripts under `./scripts/*` are ESM and can no longer be `require()`d, and the CommonJS bundle moves from `dist/*.js` to `dist/*.cjs`. Consumers going through the package entry points (`import` or `require` of `@openagenda/intl` and its subpaths) are unaffected — dual CJS/ESM output is preserved.

  - New optional `react-intl` ^10 peer dependency.
  - `hoist-non-react-statics` added as a dependency.
  - Build moves from tsup to tsdown.

## 1.1.6

### Patch Changes

- [`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - intl now support typescript files
