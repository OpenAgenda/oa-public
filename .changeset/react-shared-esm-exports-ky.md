---
'@openagenda/react-shared': major
---

The build moves from Babel to tsdown and ships `.mjs` files behind an explicit `exports` map.

- Deep imports must use bare subpaths (`@openagenda/react-shared/components/ConsentBanner`) — `/dist/….js` paths no longer resolve. SCSS and CSS remain available under `./scss/*` and `./css/*`.
- `axios` is replaced with `ky`.
- `react-intl` 6 → 10.
- Primary color updated from `#41acdd` to `#1d77ce`, including the react-date-range theme (new `--rdr-*` variables).
- Refreshed br/ca/es translations.
