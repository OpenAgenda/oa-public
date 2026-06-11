---
'@openagenda/common-labels': major
---

The package is now ESM-only (`"type": "module"`) — `require('@openagenda/common-labels')` no longer works.

- Locale fixes and additions: `accessiblities` → `accessibilities`, new `accessibleEvent` and `detail` keys, `geo.json` shipped for every locale, refreshed Breton and Dutch translations.
- `react-intl` 6 → 10; dropped the unused `dedent` dependency.
