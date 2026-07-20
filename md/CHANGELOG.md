# @openagenda/md

## 2.0.1

### Patch Changes

- [#207](https://github.com/OpenAgenda/oa/pull/207) [`31c43a7`](https://github.com/OpenAgenda/oa/commit/31c43a7c75fce44e065f642700b8d8ee593c47c3) Thanks [@clement180](https://github.com/clement180)! - `validateMarkdown` now inspects link/image destinations across every markdown syntax — reference definitions (`[id]: …`), autolinks (`<scheme:…>`), images and angle-bracketed destinations — not just inline `[text](url)`. Previously a `javascript:`/`data:` payload written with any of those syntaxes passed validation and, since the legacy export renders markdown without sanitizing at read time, was served as a live href. Encoded-entity payloads (`java&#x73;cript:`, `javascript&colon;`) remain covered.

## 2.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The package is now ESM-only: the CommonJS build (`dist/index.cjs`) is gone and `main` points to `src/index.js` — `require('@openagenda/md')` no longer works.

  - `fromMarkdownToHTML` processes the whole document at once (instead of paragraph by paragraph) and accepts a `sanitize` option to control DOMPurify.
  - New `validateMarkdown` export.
  - Link conversion utilities extracted (`convertTextLinks`, `extractLinksAsInMarkdown`).
  - `isomorphic-dompurify` 2.8 → 2.22.

## 1.0.1

### Patch Changes

- [`507cf12`](https://github.com/OpenAgenda/oa/commit/507cf127fef88e6c4e902cc8064fdff47d268c83) Thanks [@kaore](https://github.com/kaore)! - mailto in link breaks markdown conversion
