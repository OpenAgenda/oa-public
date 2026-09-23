# Change Log

## 3.0.0

### Major Changes

- [#321](https://github.com/OpenAgenda/oa/pull/321) [`5b06981`](https://github.com/OpenAgenda/oa/commit/5b06981f2da0f07a29b37fc299da6bcb47f6db97) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Drop the `@emotion/react` dependency. The six `css` props the package used move to a single stylesheet shipped with the package, and the JSX runtime falls back to `react/jsx-runtime`, so `build/` no longer imports emotion at all.

  Emotion carried only ~70 lines of static CSS here, but it set `jsxImportSource` for every emitted file and pulled in `@emotion/babel-plugin` — one of the pieces standing between this package and dropping babel. Emotion does not leave the dependency graph though: `react-select`, reached through `@openagenda/react-shared`, still depends on it.

  **Breaking:** the rules are no longer injected at runtime. Load the stylesheet once in the host application, after the framework stylesheet the components sit on (bootstrap) — from sass, from a bundler, or as a plain `<link>` next to `dist/main.js`:

  ```scss
  @import '@openagenda/react-filters/style'; // without the extension, so sass inlines it
  ```

  ```js
  import '@openagenda/react-filters/style.css';
  ```

  ```html
  <link
    rel="stylesheet"
    href="https://unpkg.com/@openagenda/react-filters@3.0.0/dist/style.css"
  />
  ```

  Consumers that only import helpers (`fetchLocale`, `getFilterSelectOptions`, `locales`, …) have nothing to do.

  **Breaking:** `components/fields/MapField/mapStyle` is gone, along with the `markerClusterStyle` and `gestureHandlingStyle` objects it exported. Consumers that spread them into their own `css` prop can simply drop them: `MapField/Map` carries the `oa-filters-map` class itself — merging any `className` it receives — and the stylesheet targets that class.

  Two things worth knowing:

  - The `oa-filters-*` class names the components now carry (`oa-filters-value-badge`, `oa-filters-choice-search`, `oa-filters-map`, `oa-filters-map-container`, `oa-filters-search-here`, `oa-filters-search-here-button`) are part of the public API — they are meant to be targeted from a consumer stylesheet. Every rule uses a single class and relies on source order to win against `.btn`, `.badge` and `.form-control`, which is what emotion did by appending to `<head>`; a rule of your own placed after the import still overrides them.
  - `height: 100%` applies to the map only under `MapField`, the component that lays it out. `MapField/Map` rendered on its own is sized by whoever renders it, as before.

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

### Patch Changes

- [#282](https://github.com/OpenAgenda/oa/pull/282) [`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Jest from 29.7 to 30.4.2, along with `babel-jest`, `@jest/globals` and `jest-environment-jsdom` (30.4.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  Jest 30 supports `import.meta.filename` and `import.meta.dirname` natively, so the local patch these packages relied on (`jest-runtime@29.7.0`) is removed along with its `resolutions` entry.

- [#281](https://github.com/OpenAgenda/oa/pull/281) [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Storybook from 10.2 to 10.5.7, along with `@storybook/react-webpack5`, `@storybook/html-vite` and `@storybook/addon-webpack5-compiler-babel` (4.0.0 to 4.0.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  All of these were already on `^10.2.0` carets that permitted 10.5.7, so the resolved version was the only thing lagging; the declarations now state what is installed.

- [#270](https://github.com/OpenAgenda/oa/pull/270) [`903ab34`](https://github.com/OpenAgenda/oa/commit/903ab34745418c627c13cc126a0016bd6a49c84b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Align the build toolchain with the versions `@openagenda/agenda-portal` moved to, so the monorepo resolves a single copy of each. Build-time dependencies only — no runtime or API change — but the published bundles are produced by a newer webpack.

  `webpack` 5.89 → 5.109, `webpack-cli` 5 → 7, `sass` 1.69/1.83 → 1.102, `sass-loader` 10 → 17, `babel-loader` 9 → 10, `webpackbar` 5.0.0-3 → 7, `terser-webpack-plugin` → 5.6.1, `source-map-loader` 2 → 5, `style-loader` → 4.

  `webpackbar` was the blocker: the 5.0.0-3 prerelease passes options that webpack 5.109's tightened `ProgressPlugin` schema rejects, which broke the build outright. In `@openagenda/react-filters` the progress bar sits behind `process.stdout.isTTY`, so this would have failed in a developer's terminal while CI stayed green.

  `@openagenda/react-filters` also gains an explicit `style-loader` devDependency: its Storybook config used the loader while relying on it being hoisted from another workspace.

- [#321](https://github.com/OpenAgenda/oa/pull/321) [`7501a67`](https://github.com/OpenAgenda/oa/commit/7501a677b9bd5e4d41406be9fb7e63c7352dd845) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Rename the source files that contain JSX from `.js` to `.jsx`.

  The extension is the only thing that told the bundler a file held JSX. `tsdown.config.ts` carried a `loader: { '.js': 'jsx' }` override to say so; the files now say it themselves and the override is gone. Nothing about the published surface changes: the emitted file names under `build/` are identical, and every public subpath resolves where it did before.

  Worth knowing for anyone reading the CJS output: the interop helper esbuild emits, `__toESM(mod, isNodeMode)`, picks `isNodeMode` from the source file's extension, so the files that became `.jsx` now emit `__toESM(mod)` where they used to emit `__toESM(mod, 1)`. The difference only shows on a dependency that sets `__esModule` _and_ `exports.default` — here that is `react-use/lib/{usePrevious,useLatest,useIsomorphicLayoutEffect}`, all three consumed as `X.default || X`, which holds under either shape. No consumer of this package requires it from CJS.

- [#329](https://github.com/OpenAgenda/oa/pull/329) [`570c34b`](https://github.com/OpenAgenda/oa/commit/570c34ba1b093196268e309f6745f0fad080869b) Thanks [@kaore](https://github.com/kaore)! - Build the choice facet's alphabetical ordering with `@openagenda/intl`'s shared `getSortCollator` instead of a local collator. The visible change is `numeric: true`: a numbered option set ("1er", "2e", "10e") now sorts numerically in facets, matching how `@openagenda/form-schemas` orders the same options in the form.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1), [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7), [`903ab34`](https://github.com/OpenAgenda/oa/commit/903ab34745418c627c13cc126a0016bd6a49c84b), [`ffc274e`](https://github.com/OpenAgenda/oa/commit/ffc274eab4d1173d5f5463b6db345cfc47383fb8), [`8ec6dc2`](https://github.com/OpenAgenda/oa/commit/8ec6dc23471a3b60fb14fedad7bf647741c071b5), [`5aafa09`](https://github.com/OpenAgenda/oa/commit/5aafa0995e9a91b4df187536c559610121dc8c44), [`a5214af`](https://github.com/OpenAgenda/oa/commit/a5214afb4357242e5b65490b13e87547fe590e07)]:
  - @openagenda/react-shared@3.1.0
  - @openagenda/intl@2.1.0
  - @openagenda/react-portal-ssr@1.2.0

## 2.13.8

### Patch Changes

- [#210](https://github.com/OpenAgenda/oa/pull/210) [`6a8c4a7`](https://github.com/OpenAgenda/oa/commit/6a8c4a796de656b7809c32c91a7bade52384a2f5) Thanks [@kaore](https://github.com/kaore)! - Bump `swiper` from `^11.2.6` to `^12.1.2` to remediate a critical prototype-pollution advisory (GHSA affecting `swiper >= 6.5.1, < 12.1.2`). The only consumer is `TimelineField`, which uses the module-based `swiper/react` + `swiper/modules` API (`FreeMode`, `Navigation`) that is unchanged across Swiper v9–v12, so this is a drop-in security bump.

- [#226](https://github.com/OpenAgenda/oa/pull/226) [`6554727`](https://github.com/OpenAgenda/oa/commit/6554727ba5f4aa47751a382490131477c3afc7e3) Thanks [@kaore](https://github.com/kaore)! - Bump `express` to `^4.21.2` (and `body-parser` to `^1.20.3` where declared) to
  remediate the `body-parser` url-encoded request DoS and the `path-to-regexp`
  route-matching ReDoS carried by express 4.18.x. First-party dependency bumps,
  no `resolutions` overrides.
- Updated dependencies []:
  - @openagenda/react-shared@3.0.1

## 2.13.7

### Patch Changes

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/intl@2.0.0
  - @openagenda/react-portal-ssr@1.1.0
  - @openagenda/react-shared@3.0.0

## 2.13.2

### Patch Changes

- [`ae1ea12`](https://github.com/OpenAgenda/oa/commit/ae1ea12c045351b375e7eddc6ea46a2d95dc735f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Fix build

- Updated dependencies [[`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f)]:
  - @openagenda/intl@1.1.6
  - @openagenda/react-shared@2.4.5

## 2.13.1

### Patch Changes

- [`3cef30d`](https://github.com/OpenAgenda/oa/commit/3cef30d15f26a2f2bf267941b80a7bd3fd27f560) Thanks [@bertho-zero](https://github.com/bertho-zero)! - don't load geo data and block map viewport when initialViewport is absent

- Updated dependencies []:
  - @openagenda/react-shared@2.4.4

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.1](https://github.com/OpenAgenda/oa/compare/@openagenda/react-filters@1.1.0...@openagenda/react-filters@1.1.1) (2020-11-23)

**Note:** Version bump only for package @openagenda/react-filters

## 1.1.0 (2020-11-23)

### Features

- **react-filters:** create package ([0323f92](https://github.com/OpenAgenda/oa/commit/0323f92411f4c1009caf764a2b9f3afe22dbd9f3))
- **react-filters:** FiltersProvider exposes form to the parent as ref ([2034d28](https://github.com/OpenAgenda/oa/commit/2034d28f9f44f4fb1d9c242a0f2a2104e68df08b))
- **react-filters:** pass filter props ([5c2f8d1](https://github.com/OpenAgenda/oa/commit/5c2f8d15bbdf775fb0326efa2da7e5e4dde856f8))
- **react-filters:** translate endDate and startDate placeholders ([f6673fc](https://github.com/OpenAgenda/oa/commit/f6673fca04680a08df800156839a7956ea68acfc))
- **react-filters:** update style ([e1d25bc](https://github.com/OpenAgenda/oa/commit/e1d25bc660aaf3eef3cc1da57e5209ad5373847a))

### Bug Fixes

- **react-filters:** missing react key ([30cc70a](https://github.com/OpenAgenda/oa/commit/30cc70a84df820bcd3e7d38234d3bd5911e70f03))
