---
'@openagenda/widgets': patch
---

Automate the CDN deployment of the widgets bundle on release. The release workflow now uploads the freshly built `dist/` to the OpenStack Swift `js` container and purges the KeyCDN `assets` zone whenever `@openagenda/widgets` is published, reusing `scripts/upload.sh` (made CI-aware: KeyCDN key and Swift credentials come from the environment, with the 1Password path kept as the local fallback).
