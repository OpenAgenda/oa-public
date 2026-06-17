# @openagenda/common-labels

## 2.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The package is now ESM-only (`"type": "module"`) — `require('@openagenda/common-labels')` no longer works.

  - Locale fixes and additions: `accessiblities` → `accessibilities`, new `accessibleEvent` and `detail` keys, `geo.json` shipped for every locale, refreshed Breton and Dutch translations.
  - `react-intl` 6 → 10; dropped the unused `dedent` dependency.
