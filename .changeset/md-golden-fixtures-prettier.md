---
---

test(md): keep golden-file test fixtures byte-exact — prettier-ignore
`public/md/test/fixtures/` (markdown hard breaks are two trailing spaces, so
reformatting corrupts them) and account for the EOF newline in the reversability
round-trip. Test/tooling only; no change to the published package.
