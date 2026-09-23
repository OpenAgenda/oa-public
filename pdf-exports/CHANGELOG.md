# @openagenda/pdf-exports

## 0.1.0

### Minor Changes

- [#350](https://github.com/OpenAgenda/oa/pull/350) [`7d2be33`](https://github.com/OpenAgenda/oa/commit/7d2be33a3533ff16944a6a187514a7f31c9d84e2) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Fix a render crash on decomposed capital accents, and wire the `test` script back to the test scripts that exist.

  Both text cleaners now compose to NFC before rendering. A combining mark over a capital (`E` + U+0301 rather than `É`) has no GPOS anchor in the Assistant fonts, and fontkit dereferences that null anchor instead of skipping it, taking the whole render down. Text pasted from macOS or imported from some feeds carries exactly that, so an agenda or event whose title holds decomposed capitals could fail to export.

  The two cleaners handled it differently and both were wrong. `event/lib/cleanText.js` replaced two hardcoded characters, but the `É` rule had both sides composed to U+00C9, making it a no-op, and the `Î` rule matched the bare combining circumflex, which would have turned `Î` into `IÎ` — so the event export crashed. `utils/cleanString.js`, used across the agenda export, stripped U+0301 and U+0302 outright: it silently dropped those accents (`SOIRÉE` came out `SOIREE`) while leaving U+0300 and U+0308 in place, so `À`, `È`, `Ë` and `Ü` still crashed it.

  Composing to NFC keeps the accent and covers every mark rather than the handful added one crash at a time; anything with no composed form is dropped afterwards, since it would still crash.

  The `test` script invoked `test/addEventItem.test.js`, `test/addFooter.test.js` and `test/addHeader.test.js`, but those moved to `list/test/` in `0ba9a48bc5` and then to `agenda/test/` in `0064e0a0a8` without the script following, so it has failed to even start since 2023. It now runs `scripts/test.js`, which executes every `*.test.js` under `agenda/test/` and `event/test/` in a child process and fails on any non-zero exit — 23 render scripts instead of the 3 the old script named. It takes an optional filter argument (`yarn test event/test`, `yarn test addMarkdown`).

  Renders now go to a throwaway directory: the `event/test/*` scripts hardcoded `event/test/renders/`, which meant running them rewrote the reference PDFs tracked there. They take the destination from `event/test/lib/outputFolder.js` (honouring `PDF_TEST_FOLDER`) instead, and `yarn renders:update` refreshes the reference PDFs on purpose.

  `event/test/renderEvent.test.js` additionally waits for each write stream to flush before checking that every render produced a non-empty file with a PDF magic number, rather than resolving while the file was still being written.

  The Node floor moves to `>=20.11.0`, where `import.meta.dirname` became available.

- [#318](https://github.com/OpenAgenda/oa/pull/318) [`1e50cc2`](https://github.com/OpenAgenda/oa/commit/1e50cc2141318df4987c0f589a388f78eb637aa6) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move `sharp` from `^0.32.6` to `^0.35.3`.

  **Node >= 20.9.0 is now required** (0.32 accepted >= 14.15), and the package now declares that floor in `engines`.

  The reason is packaging, not features: the only API this package uses is `sharp(buffer).metadata()`, unchanged across the two versions. But 0.32 fetches its native binary from GitHub release assets through an install script, falling back to a full `node-gyp` build when that fails; 0.35 resolves it as ordinary npm packages (`@img/sharp-*`), pinned by the lockfile and served from the registry cache. Installing this package no longer depends on GitHub being reachable, nor on the host carrying a C++ toolchain — and since it is imported eagerly, a missing binary took down whatever imported it rather than just degrading PDF export.

  It closes a stale window too: the `^0.32.6` pin was taken for CVE-2023-4863 (libwebp), and that copy still carries libvips 8.14.5 from September 2023. 0.35.3 ships libvips 8.18.3.

### Patch Changes

- [#328](https://github.com/OpenAgenda/oa/pull/328) [`fae95e4`](https://github.com/OpenAgenda/oa/commit/fae95e4be12de83f709bfeb0793e5e05b62280dc) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Align on `date-fns-tz@^2` and import its members by name.

  Both packages were still on `date-fns-tz@^1.3.7` while the rest of the monorepo had moved to `^2`, and both reached for the library through a default import (`import dateFnsTz from 'date-fns-tz'` followed by destructuring). That works against the 1.x build, whose `exports` map offers CommonJS only, but 2.x adds an `import` condition pointing at an ESM build that has no default export — so the same specifier resolves to two incompatible shapes depending on which version wins.

  Nothing broke as long as each package kept its own nested copy, but a bundler that dedupes by bare specifier collapses them into one and the default import then resolves to the ESM build and fails. That is what took down the event stories under Vite.

  Named imports are correct against 2.x under both Node and any bundler, and both packages now request the same major as the rest of the monorepo. Copies still remain elsewhere in the tree — `react-filters` asks for `^2.0.1` and keeps its own — so this narrows the mismatch rather than dedupes the install outright.

- [#437](https://github.com/OpenAgenda/oa/pull/437) [`c84519e`](https://github.com/OpenAgenda/oa/commit/c84519e70a65fa0f42e2a4682b99bd59b5b62600) Thanks [@kaore](https://github.com/kaore)! - The agenda export takes five new options, `includeAccessibility`, `includeDescription`, `includeEventLink`, `includeLocation` and `includeRegistration`, so a caller can leave the accessibility icons, the description, the link to the event page on openagenda.com, the location line or the registration entries out of every item. An export without images no longer keeps the thumbnail's height as a floor for every item, so short items no longer leave a blank block under them. Each defaults to `true`; a dropped line takes no room, and the simulate pass that drives pagination sees the same layout as the real one.

- [#357](https://github.com/OpenAgenda/oa/pull/357) [`7dc95ac`](https://github.com/OpenAgenda/oa/commit/7dc95ac583b6276f056e47ed1fc8e1eb2f29e662) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Anchor the render-time bucket rewrite on the `/dev/` path segment instead of a bare `dev`. `String.replace` with a string pattern matches the first occurrence anywhere in the URL, so in production — where there is no bucket segment to find — the match landed in the object name: `/main/agenda-developpement.jpg` was fetched as `/main/agenda-maineloppement.jpg`, 404'd, and fell back to the placeholder image. Every other URL shape resolves exactly as before.

- [#441](https://github.com/OpenAgenda/oa/pull/441) [`f3b4a19`](https://github.com/OpenAgenda/oa/commit/f3b4a1984365f9665ad208f22b7fd9a0d40adc8a) Thanks [@kaore](https://github.com/kaore)! - Event PDF: the timings section no longer shows the wrong month and a day-early date for agendas in a negative-offset timezone.

  `spreadTimings` buckets timings under zone-less calendar keys — `"2026-09"`, `"2026-09-18"` — the timezone having already done its work when the key was built. The timings section fed those strings back through `new Date()`, which reads a date-only form as UTC midnight, then rendered the result in the event timezone: at UTC-4 that lands the day before. Event 4901119 of `jep-2026-martinique` (18-20 September, `America/Martinique`) was titled « Août 2026 » over « jeudi 17 / vendredi 18 / samedi 19 ». Agendas at a positive offset were unaffected, which is why it went unseen.

  Month and day labels are now formatted as the calendar values they are, so they no longer depend on the event timezone — nor on the server's.

  The unused `formattedDates` helper is removed along with it — it was the package's only `moment` consumer,
  which is dropped from the dependencies.

- [#411](https://github.com/OpenAgenda/oa/pull/411) [`45cffe9`](https://github.com/OpenAgenda/oa/commit/45cffe9b4f7e9d34a6dd2764357b3245c20f22e4) Thanks [@kaore](https://github.com/kaore)! - Event PDF: a day with many timing slots no longer hangs the render.

  Each date of the timings section is one line — `sam. 19 - 09:00, 09:15, …` — and it was measured without a width, so a day with ~20 slots came out wider than any column, the month segment "never fit", and the paginator retried it on a fresh page forever: thousands of pages per second, all buffered, until the process was killed. The line now wraps within the segment's width, like it does when placed.

  The paginator also refuses to loop without progress: a segment that comes back from an empty page unchanged since the previous empty page fails the render (`PDFSegmentDoesNotFit`) instead of paginating endlessly. This covers any content that cannot be placed on an empty page — notably a plain text field longer than a page (`location.description`, a custom `text` field), which is not split across pages: such a render used to hang the same way and now fails fast.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`adf3653`](https://github.com/OpenAgenda/oa/commit/adf36534bde6e3590951e0b27649fb04e5c27e61), [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1), [`fae95e4`](https://github.com/OpenAgenda/oa/commit/fae95e4be12de83f709bfeb0793e5e05b62280dc), [`5aafa09`](https://github.com/OpenAgenda/oa/commit/5aafa0995e9a91b4df187536c559610121dc8c44)]:
  - @openagenda/date-utils@0.0.3
  - @openagenda/logs@1.2.2
  - @openagenda/intl@2.1.0

## 0.0.6

### Patch Changes

- [#212](https://github.com/OpenAgenda/oa/pull/212) [`fd387c9`](https://github.com/OpenAgenda/oa/commit/fd387c9652f39dfcb6dc72aadceb312c1fb2a733) Thanks [@kaore](https://github.com/kaore)! - Bump `sharp` from `^0.31.1` to `^0.32.6` to remediate CVE-2023-4863 (GHSA-54xq-cgqr-rpm3) — a heap buffer overflow in the bundled `libwebp` dependency, fixed in sharp 0.32.6. The sharp image API is backward compatible across 0.31 → 0.32, so this is a drop-in security bump.

## 0.0.5

### Patch Changes

- Updated dependencies [[`a3bd9bd`](https://github.com/OpenAgenda/oa/commit/a3bd9bd75ac41e5f5c62bc7e43efcd8b376ffa99)]:
  - @openagenda/logs@1.2.1

## 0.0.4

### Patch Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Robustness and i18n fixes:

  - Guard against a potential infinite loop in `addParentElement` when no progress is made.
  - Handle empty image buffers, null registration entries and zero available height.
  - Smarter long-word splitting in `addText` (degenerate cases, line-fit rounding).
  - The "Contact details" label is internationalized (new `contactDetails` message); br/es locales are filled in and `nl` is added.

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/date-utils@0.0.2
  - @openagenda/intl@2.0.0
  - @openagenda/logs@1.2.0

## 0.0.3

### Patch Changes

- Updated dependencies [[`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f)]:
  - @openagenda/intl@1.1.6

## 0.0.2

### Patch Changes

- Updated dependencies [[`9130206`](https://github.com/OpenAgenda/oa/commit/9130206f01c7b004965a026e357974f68c5d4dc9)]:
  - @openagenda/logs@1.1.10
