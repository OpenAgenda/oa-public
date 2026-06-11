---
'@openagenda/agenda-docx': major
---

Replace the redis-backed queue integration with a callback API: the `queue` option is gone, pass `onProcessGenerateRequest` instead and call the returned `processGenerateRequest` yourself.

- HTTP requests switch from `superagent` to native `fetch` (with `qs` for query strings).
- Generated documents are now named `slug.randomHex.docx` instead of `title.docx`, and the export modal link carries a `download` attribute.
- `@openagenda/verror` ^3.2.0, Storybook 10, redis dropped from the dev setup.
