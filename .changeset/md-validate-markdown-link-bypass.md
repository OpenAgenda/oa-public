---
'@openagenda/md': patch
---

`validateMarkdown` now inspects link/image destinations across every markdown syntax — reference definitions (`[id]: …`), autolinks (`<scheme:…>`), images and angle-bracketed destinations — not just inline `[text](url)`. Previously a `javascript:`/`data:` payload written with any of those syntaxes passed validation and, since the legacy export renders markdown without sanitizing at read time, was served as a live href. Encoded-entity payloads (`java&#x73;cript:`, `javascript&colon;`) remain covered.
