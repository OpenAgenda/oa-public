---
'@openagenda/pdf-exports': patch
---

Bump `sharp` from `^0.31.1` to `^0.32.6` to remediate CVE-2023-4863 (GHSA-54xq-cgqr-rpm3) — a heap buffer overflow in the bundled `libwebp` dependency, fixed in sharp 0.32.6. The sharp image API is backward compatible across 0.31 → 0.32, so this is a drop-in security bump.
