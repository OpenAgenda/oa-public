---
'@openagenda/react': patch
---

Align `@openagenda/mails` on the workspace major (`^5.0.0`). The only consumed
entry point is `extractEmails`, byte-identical between 4.0.2 and 5.0.0 — the
major only replaced `@openagenda/queues` with bullmq, an unrelated surface.
