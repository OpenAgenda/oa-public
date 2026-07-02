---
'@openagenda/mails': patch
---

Bump `nodemailer` from `^7.0.6` to `^9.0.1` (resolves 9.0.3) to remediate a high-severity advisory affecting `nodemailer <= 9.0.0` (message-level `raw` option bypassing `disableFileAccess`/`disableUrlAccess`, enabling arbitrary file read / SSRF) plus several medium CRLF/normalization advisories. `@openagenda/mails` uses `nodemailer.createTransport` and the deep `nodemailer/lib/addressparser/index.js` import — both unchanged in v9 (nodemailer 9 has no `exports` map, so the deep import still resolves), and `nodemailer-mailgun-transport@^2.1.5` remains compatible. Verified via the passing `extractEmails` test, which exercises the addressparser path.
