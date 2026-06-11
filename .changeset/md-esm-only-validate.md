---
'@openagenda/md': major
---

The package is now ESM-only: the CommonJS build (`dist/index.cjs`) is gone and `main` points to `src/index.js` — `require('@openagenda/md')` no longer works.

- `fromMarkdownToHTML` processes the whole document at once (instead of paragraph by paragraph) and accepts a `sanitize` option to control DOMPurify.
- New `validateMarkdown` export.
- Link conversion utilities extracted (`convertTextLinks`, `extractLinksAsInMarkdown`).
- `isomorphic-dompurify` 2.8 → 2.22.
