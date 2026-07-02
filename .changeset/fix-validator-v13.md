---
'@openagenda/agenda-portal': patch
---

Bump `validator` to `^13.15.22` (resolves 13.15.35) to remediate a high-severity advisory (incomplete filtering of special elements, `< 13.15.22`) plus medium `isURL` bypass and ReDoS advisories. Only `isEmail`, `isURL` and `isIP` (deep-imported from `validator/lib/*`) are used across the affected packages; all three behave correctly in v13 for representative inputs. `agenda-portal` declares validator but has no direct usage, so this is a lockfile-level bump for it.
