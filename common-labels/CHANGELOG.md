# @openagenda/common-labels

## 2.0.1

### Patch Changes

- [#328](https://github.com/OpenAgenda/oa/pull/328) [`7979599`](https://github.com/OpenAgenda/oa/commit/7979599f1c39658f6f20a49c09eaeebf706a27f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Load compiled locales through a generated map of per-bundle modules instead of a template-literal specifier.

  `fetchLocale` built its specifier as ``import(`./locales-compiled/${locale}/${messagesPath}.json`)``, which bundlers can only resolve by globbing. Vite deliberately collapses `**` to `*` when it does that, so a `messagesPath` spanning two segments — `event/fields`, `event/attendanceModes` and the other `event/*` bundles — fell outside the generated map and threw `Unknown variable dynamic import` at runtime.

  `scripts/build` now emits `build/localeLoaders.js`, a two-level map of plain dynamic imports that every bundler can follow statically, plus one small `build/locales/<lang>/<bundle>.js` module per entry.

  Those wrapper modules are what make the JSON import attributes work everywhere. Node refuses to import JSON without `with { type: 'json' }`, but that clause has to reach the browser as an _import attribute_, not as a plain argument: bundlers strip it from a static import — Vite serves JSON as a JS module, so keeping it would make the browser demand an `application/json` response and fail — while the second argument of a dynamic `import()` is an ordinary expression nobody rewrites. Each wrapper therefore holds the static import, and the map only ever holds dynamic imports of those.

  Granularity is unchanged: one bundle in, one bundle loaded, matching the `fetchLocale(messagesPath, locale)` signature.

  Both generated artefacts now cover whatever `compile` actually produced rather than a language list held separately in the build script — which is how `nl` came to be compiled but absent from `build/index.js`. It is exported alongside the others from now on.

  The signature is unchanged. An unknown language or bundle now rejects with a named error instead of a module resolution failure.

## 2.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The package is now ESM-only (`"type": "module"`) — `require('@openagenda/common-labels')` no longer works.

  - Locale fixes and additions: `accessiblities` → `accessibilities`, new `accessibleEvent` and `detail` keys, `geo.json` shipped for every locale, refreshed Breton and Dutch translations.
  - `react-intl` 6 → 10; dropped the unused `dedent` dependency.
