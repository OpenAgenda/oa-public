---
'@openagenda/react-timingspicker': major
---

`TimingsPicker` is now a named export: `import { TimingsPicker } from '@openagenda/react-timingspicker'` (the default export is gone, `classNames` is also exported).

- Explicit import-only `exports` map over `.mjs` files; the stylesheet stays available at `./App.css`.
- Build moves from tsup to tsdown; `react-intl` 6 → 10.
