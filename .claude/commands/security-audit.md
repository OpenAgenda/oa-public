---
description: Deep security audit of staged changes using the security-auditor subagent (complement to the built-in /security-review)
---

Invoke the `security-auditor` subagent on the current staged diff. Pass through its output verbatim — do not summarise, rephrase, or add commentary. If the subagent reports `No security issues found in staged changes.` or `No staged changes.`, relay that exact line.
