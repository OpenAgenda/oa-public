# Change Log

## 2.1.0

### Minor Changes

- [#453](https://github.com/OpenAgenda/oa/pull/453) [`568c2d4`](https://github.com/OpenAgenda/oa/commit/568c2d4030d3e530cb6677a2c94dad6113ed27d8) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The responsive `Image` built by `responsiveImage`, `responsiveImageFromServed` and `injectResponsiveImage` no longer carries `credits`. Image credits belong to the owning resource's `imageCredits`.

## 2.0.0

### Major Changes

- [#347](https://github.com/OpenAgenda/oa/pull/347) [`f4cf835`](https://github.com/OpenAgenda/oa/commit/f4cf8352a222b9084b77b12d69abdc91c07e1749) Thanks [@clement180](https://github.com/clement180)! - Le paquet redevient public, en ESM.

  Il ne contient plus que ce qui a du sens hors du monorepo — le trio images, `Stopwatch`, `cleanString`, `isInteger` — après trois lots qui en ont sorti les dépendances fantômes, le fourre-tout d'avant ES2015 et les utilitaires métier, partis chez leur propriétaire.

  **ESM uniquement.** Pas de sortie CJS : aucun consommateur ne l'était réellement. Le seul paquet en CommonJS, `cibul-templates`, est du code navigateur bundlé par webpack, jamais résolu par Node.

  **Les imports profonds de fichiers disparaissent** au profit de deux points d'entrée. Une majeure est le moment où la surface d'import a le droit de changer :

  | Avant                                                 | Après                                                              |
  | ----------------------------------------------------- | ------------------------------------------------------------------ |
  | `@openagenda/utils/responsiveImage.js`                | `@openagenda/utils/images`                                         |
  | `@openagenda/utils/imageAtSize.js` (défaut)           | `import { imageAtSize } from '@openagenda/utils/images'`           |
  | `@openagenda/utils/injectResponsiveImage.js` (défaut) | `import { injectResponsiveImage } from '@openagenda/utils/images'` |
  | `@openagenda/utils/Stopwatch.js` (défaut)             | `import { Stopwatch } from '@openagenda/utils'`                    |
  | `@openagenda/utils/isInteger.js` (défaut)             | `import { isInteger } from '@openagenda/utils'`                    |

  La racine réexporte tout ; `./images` regroupe le trio images et ses aides. Les exports par défaut deviennent nommés.

  **Aucune étape de build** : les sources ESM sont publiées telles quelles, comme `@openagenda/logs`. Rien à compiler pour consommer le paquet.

  Aucun changement de comportement : les fichiers sont ceux de la 1.3.0, seule la forme des exports change. Les tests du paquet et ceux des consommateurs sont inchangés.

- [#366](https://github.com/OpenAgenda/oa/pull/366) [`5208ba8`](https://github.com/OpenAgenda/oa/commit/5208ba8d25dbecc3e3719337c95bafc497dcdfa1) Thanks [@clement180](https://github.com/clement180)! - Add `@openagenda/utils/shortId`, a short identifier a human can read out loud.

  Crockford base32 at six characters: it drops `I`, `L`, `O` and `U`, and holds 1 073 741 824 values — more than base62 at five would — so the readable alphabet costs one character and nothing else. `normalize()` folds case and maps the look-alikes back, and a route that looks an id up must run what the user typed through it.

  The default export is `unique(taken)`, which draws until the id is free and then records it in `taken` — **a Set or an array of ids**. Recording is the point rather than a convenience: uniqueness only has to hold within a collection, but a caller that seeds `taken` from stored ids and forgets to record each fresh draw ships duplicates inside its own batch. Bind the collection to a variable and reuse it across draws; a fresh `ids.map(…)` per draw defeats the guarantee. The raw draw is the named `draw()`.

  A Map is refused, with a message saying to pass `new Set(map.keys())`: on a `Map<id, value>` there is nothing honest to record — recording invented a `true` value among the real ones, and the caller's next pass over `.values()` broke on it.

  `normalize()` also drops the separators Crockford allows (`4H7-M2K`, `4H7 M2K`), and returns `null` for anything that is not an id in the alphabet once folded, rather than handing back a string that matches nothing.

  **Node >= 19 is required** — declared in `engines`, and the reason this release is a major. The floor comes from `globalThis.crypto.getRandomValues` as a default global, and it applies to the whole package rather than to `shortId` alone: every existing consumer inherits it, and Yarn Berry turns it into a hard install failure for anyone still on Node 18. Node 18 reached end of life in April 2025.

### Minor Changes

- [#363](https://github.com/OpenAgenda/oa/pull/363) [`b1af35c`](https://github.com/OpenAgenda/oa/commit/b1af35c41237a8a3e9d6e0510b8c70163c9c70af) Thanks [@clement180](https://github.com/clement180)! - Add two subpath exports, `@openagenda/utils/iso4217` and `@openagenda/utils/isoDatetime`.

  `iso4217` carries the ISO 4217 code list and its minor-unit exponents, so an integer amount converts to and from its display form without assuming the exponent is 2 — it is 0 for JPY and XOF, 3 for KWD and TND. `isoDatetime` accepts only ISO-8601 datetimes that carry an explicit offset (and rejects a value like `2026-02-31T10:00:00Z`, which parses but rolls over to March 3), plus the duration subset that expresses "N before the start" — weeks to seconds, years and months refused as having no single answer.

  The datetime forms `Date.parse` does not read on every engine are normalised rather than refused: the space separator, a lowercase `z`, and the decimal comma are all conformant ISO-8601, and a value accepted on the server must not be refused by a browser. Errors carry a `reason` — the message without the `isoDatetime: ` prefix — for callers that re-emit the explanation inside their own error shape.

  Both are pure, dependency-free and isomorphic.

### Patch Changes

- [#357](https://github.com/OpenAgenda/oa/pull/357) [`4c5cb96`](https://github.com/OpenAgenda/oa/commit/4c5cb962dfb314c8d4e8df158a69205e6f1c60a6) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `nativeImageUrl` no longer drops the geometry it was asked for on an absolute value. It used to return any absolute URL verbatim, which meant every caller handing it one of our own served sources — `{root}/{uuid}.full.image.jpg`, the shape the v2 read layer produces — got the full-size original back instead of the rendition it requested.

  `servedSource` now draws the line, and it draws it **by suffix, not by origin**: a value whose last segment is a `.full.image.jpg` source is ours and is recomposed, anything else that is absolute still passes through untouched. The recomposition uses the bucket the value itself names (`{root}/{bucket}/{source}`) rather than the configured one, so a value served from another bucket keeps addressing the object where it actually lives.

  `ABSOLUTE` also stopped being narrowed to `http(s)`, so a protocol-relative or otherwise-schemed URL is recognized as absolute like any other.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.3.0](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.9...@openagenda/utils@1.3.0) (2020-11-23)

### Features

- **utils:** add toMixedMultipart ([21137e3](https://github.com/OpenAgenda/oa/commit/21137e338d4d4423371e0378f3ad40a205dfe77f))
- **utils:** added express util middleware compareModifiedSince ([ada5f0e](https://github.com/OpenAgenda/oa/commit/ada5f0efb96879c1831a8bcf20723d080f06f961))

### Bug Fixes

- **utils:** registration addType does not throw exception when reading null value ([92e003d](https://github.com/OpenAgenda/oa/commit/92e003db05fced9feb54833498f2dd6925bd6d17))

### [1.2.9](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.8...@openagenda/utils@1.2.9) (2020-07-16)

**Note:** Version bump only for package @openagenda/utils

### [1.2.8](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.7...@openagenda/utils@1.2.8) (2020-07-13)

**Note:** Version bump only for package @openagenda/utils

### [1.2.7](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.6...@openagenda/utils@1.2.7) (2020-07-10)

### Bug Fixes

- fix links in changelogs ([84e2460](https://github.com/OpenAgenda/oa/commit/84e24609981f4ee3bb9e34ef52109d74abe97a62))

### [1.2.6](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.5...@openagenda/utils@1.2.6) (2020-07-08)

**Note:** Version bump only for package @openagenda/utils

### [1.2.5](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.4...@openagenda/utils@1.2.5) (2020-07-06)

### Bug Fixes

- **utils:** express utils are inserted into client-side libs causing transpiling complications ([52d784b](https://github.com/OpenAgenda/oa/commit/52d784b714f052eb74a8635bc91505e4cd9d1133))

### [1.2.4](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.3...@openagenda/utils@1.2.4) (2020-06-18)

**Note:** Version bump only for package @openagenda/utils

### [1.2.3](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.2...@openagenda/utils@1.2.3) (2020-06-09)

**Note:** Version bump only for package @openagenda/utils

### [1.2.2](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.1...@openagenda/utils@1.2.2) (2020-05-22)

**Note:** Version bump only for package @openagenda/utils

### [1.2.1](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.2.0...@openagenda/utils@1.2.1) (2020-05-19)

**Note:** Version bump only for package @openagenda/utils

## [1.2.0](https://github.com/OpenAgenda/oa/compare/@openagenda/utils@1.1.1...@openagenda/utils@1.2.0) (2020-05-15)

### Features

- **utils:** added https middleware ([7796aa1](https://github.com/OpenAgenda/oa/commit/7796aa1f4f3c199ef56dd42856f298fa628f9e58))
- **utils:** function to extract type from list of registration values ([b087f8d](https://github.com/OpenAgenda/oa/commit/b087f8d624519181c57d6c8687f673ef387f0dab))

## <small>1.1.1 (2020-04-03)</small>

- fix deps ([71703f8](https://github.com/OpenAgenda/oa/commit/71703f8))
- remove .yarn ([12c82a6](https://github.com/OpenAgenda/oa/commit/12c82a6))
