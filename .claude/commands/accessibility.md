---
description: Audit staged changes for RGAA / accessibility issues using the accessibility-reviewer subagent
---

Invoke the `accessibility-reviewer` subagent on the current staged diff. Pass through its output verbatim — do not summarise, rephrase, or add commentary. If the subagent reports `No accessibility issues found in staged changes.` or `No staged changes.`, relay that exact line.
