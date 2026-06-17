# @openagenda/intl

## 2.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The package is now `"type": "module"`: the CLI scripts under `./scripts/*` are ESM and can no longer be `require()`d, and the CommonJS bundle moves from `dist/*.js` to `dist/*.cjs`. Consumers going through the package entry points (`import` or `require` of `@openagenda/intl` and its subpaths) are unaffected — dual CJS/ESM output is preserved.

  - New optional `react-intl` ^10 peer dependency.
  - `hoist-non-react-statics` added as a dependency.
  - Build moves from tsup to tsdown.

## 1.1.6

### Patch Changes

- [`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - intl now support typescript files
