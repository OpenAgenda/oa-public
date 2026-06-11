---
'@openagenda/intl': major
---

The package is now `"type": "module"`: the CLI scripts under `./scripts/*` are ESM and can no longer be `require()`d, and the CommonJS bundle moves from `dist/*.js` to `dist/*.cjs`. Consumers going through the package entry points (`import` or `require` of `@openagenda/intl` and its subpaths) are unaffected — dual CJS/ESM output is preserved.

- New optional `react-intl` ^10 peer dependency.
- `hoist-non-react-statics` added as a dependency.
- Build moves from tsup to tsdown.
