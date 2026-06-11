---
'@openagenda/mails': major
---

Upgrade `nodemailer` 6 → 7 — its option and behavior changes pass through to consumers providing transport configuration.

- Fix an inverted condition: the "createWorker method has not been implemented" error was raised when `createWorker` **was** provided, and queue setups without it went undetected.
- Normalize `references` / `in-reply-to` headers (via `_encodeHeaderValue`) so Mailgun accepts them; `references` accepts arrays.
- `@openagenda/verror` ^3.2.0.
