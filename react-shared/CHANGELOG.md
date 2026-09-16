# Change Log

## 3.1.0

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

- [#282](https://github.com/OpenAgenda/oa/pull/282) [`ffc274e`](https://github.com/OpenAgenda/oa/commit/ffc274eab4d1173d5f5463b6db345cfc47383fb8) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Replace enzyme with `@testing-library/react` in the test suite. Development tooling only — no runtime or API change, and nothing in the published output differs.

  The enzyme adapter went through `react-shallow-renderer`, which reads a React internal that React 19 renamed, so it threw at import time and the suite had not run since February 2025. `enzyme` and `@cfaester/enzyme-adapter-react-18` are dropped, and with them the transitive `react-test-renderer` and `react-shallow-renderer`, both deprecated for React 19.

- [#282](https://github.com/OpenAgenda/oa/pull/282) [`8ec6dc2`](https://github.com/OpenAgenda/oa/commit/8ec6dc23471a3b60fb14fedad7bf647741c071b5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Fix `hasNewValues` and `appendNewValues` never recognising a value as already present.

  `extractNewValues` destructured `value1` off each existing option instead of `value`, so the comparison always failed and nothing was ever filtered out. `hasNewValues` therefore returned `true` for any input, and `appendNewValues` re-appended values already selected — visible in `ReactSelectField` on the `isCreatable` path, where typing an existing entry duplicated it.

  The bug dates back to a lint pass in September 2024. The unit test that catches it existed the whole time but could not run: it shared a Jest setup file with an enzyme adapter that stopped loading under React 19. That setup is now local to the one test that needs enzyme, so the rest of the suite runs again.

- [#328](https://github.com/OpenAgenda/oa/pull/328) [`a5214af`](https://github.com/OpenAgenda/oa/commit/a5214afb4357242e5b65490b13e87547fe590e07) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Rename the source files that contain JSX from `.js` to `.jsx`.

  The extension was the only thing that told the bundler a file held JSX, and `tsdown.config.ts` carried a `loader: { '.js': 'jsx' }` override to say so. The files now say it themselves and the override is gone.

  Nothing consumers see changes. The package emits ESM only, so there is no CJS interop helper to shift: the 74 emitted `.mjs` files keep their names, and the only content that moved is the `//#region src/…` marker comments rolldown writes, which now name the `.jsx` source. Every public subpath resolves where it did.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1), [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7), [`7979599`](https://github.com/OpenAgenda/oa/commit/7979599f1c39658f6f20a49c09eaeebf706a27f9), [`5aafa09`](https://github.com/OpenAgenda/oa/commit/5aafa0995e9a91b4df187536c559610121dc8c44), [`75e2a2f`](https://github.com/OpenAgenda/oa/commit/75e2a2f48a5ba8f8cffa925ce608b6e70ddc337c)]:
  - @openagenda/md@2.0.2
  - @openagenda/intl@2.1.0
  - @openagenda/uikit@0.3.0
  - @openagenda/common-labels@2.0.1

## 3.0.1

### Patch Changes

- Updated dependencies [[`31c43a7`](https://github.com/OpenAgenda/oa/commit/31c43a7c75fce44e065f642700b8d8ee593c47c3), [`c70935e`](https://github.com/OpenAgenda/oa/commit/c70935ec5f6cb62d0e2bf823c47e6a5c823be969)]:
  - @openagenda/md@2.0.1
  - @openagenda/uikit@0.2.0

## 3.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The build moves from Babel to tsdown and ships `.mjs` files behind an explicit `exports` map.

  - Deep imports must use bare subpaths (`@openagenda/react-shared/components/ConsentBanner`) — `/dist/….js` paths no longer resolve. SCSS and CSS remain available under `./scss/*` and `./css/*`.
  - `axios` is replaced with `ky`.
  - `react-intl` 6 → 10.
  - Primary color updated from `#41acdd` to `#1d77ce`, including the react-date-range theme (new `--rdr-*` variables).
  - Refreshed br/ca/es translations.

### Patch Changes

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/common-labels@2.0.0
  - @openagenda/intl@2.0.0
  - @openagenda/md@2.0.0
  - @openagenda/uikit@0.1.0

## 2.4.5

### Patch Changes

- Updated dependencies [[`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f), [`515a140`](https://github.com/OpenAgenda/oa/commit/515a140a8f56cebbe654a85afb3de2b6098322a3), [`bfacacd`](https://github.com/OpenAgenda/oa/commit/bfacacdfb0d37bf82be9241e9690265db4a59a2e)]:
  - @openagenda/intl@1.1.6
  - @openagenda/uikit@0.0.3

## 2.4.4

### Patch Changes

- Updated dependencies [[`507cf12`](https://github.com/OpenAgenda/oa/commit/507cf127fef88e6c4e902cc8064fdff47d268c83)]:
  - @openagenda/md@1.0.1

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [2.1.1](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.1.0...@openagenda/react-shared@2.1.1) (2020-11-23)

### Bug Fixes

- **mails:** disableVerify to false for the dev server ([fed88e4](https://github.com/OpenAgenda/oa/commit/fed88e4b048665027db7ef99aaacaadd18004cf2))

## [2.1.0](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.7...@openagenda/react-shared@2.1.0) (2020-11-23)

### Features

- **react-shard:** default size of ImageInput is now 100% ([005f6e4](https://github.com/OpenAgenda/oa/commit/005f6e42928ecc2a47746cd44fc64adcd7a3539b))
- **react-shared:** add Image and ImageInput ([2a2915f](https://github.com/OpenAgenda/oa/commit/2a2915f1b0f2cf0ce40a43221d964d59d8883d91))
- **react-shared:** add props rounded, width and height to ImageInput ([0971866](https://github.com/OpenAgenda/oa/commit/097186650ba21206091a8f5284cb7002577e8f9a))
- **react-shared:** errors ans translations for ImageInput ([3951fb8](https://github.com/OpenAgenda/oa/commit/3951fb86d578045dccfde7b1cc783d84e2c7fce9))
- **react-shared:** tweak ImageInput ([7d7e087](https://github.com/OpenAgenda/oa/commit/7d7e087f052f133be1d78da2cc1d5964660da35e))
- **react-shared:** utility to display unload page warning message ([645fe97](https://github.com/OpenAgenda/oa/commit/645fe97b53e24785a3cfa57ea394e2ba40fd0565))
- replace extensions with mime types ([e768ba8](https://github.com/OpenAgenda/oa/commit/e768ba8f32baa862ecbf5e3cc88a8f253a546b15))
- **react-shared:** update extract-messages script ([992e368](https://github.com/OpenAgenda/oa/commit/992e3684459bd78ed61cee69e8521037e74076ee))

### Bug Fixes

- **react-shared:** does node ignore lib directory ([b65bd49](https://github.com/OpenAgenda/oa/commit/b65bd497e3f8dfc60ad8578e294b16e4b5faaccc))
- **react-shared:** fix the fallback message for empty messages ([ce81dbe](https://github.com/OpenAgenda/oa/commit/ce81dbe59d44dd267bf0e373e09b91782607cfe5))
- **react-shared:** ImageInput is no longer flat ([b6e6d22](https://github.com/OpenAgenda/oa/commit/b6e6d22e3d0f4c57823d31866f67da0bf6d31489))

### [2.0.7](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.6...@openagenda/react-shared@2.0.7) (2020-07-16)

**Note:** Version bump only for package @openagenda/react-shared

### [2.0.6](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.5...@openagenda/react-shared@2.0.6) (2020-07-13)

**Note:** Version bump only for package @openagenda/react-shared

### [2.0.5](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.4...@openagenda/react-shared@2.0.5) (2020-07-10)

### Bug Fixes

- fix links in changelogs ([84e2460](https://github.com/OpenAgenda/oa/commit/84e24609981f4ee3bb9e34ef52109d74abe97a62))

### [2.0.4](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.3...@openagenda/react-shared@2.0.4) (2020-07-08)

**Note:** Version bump only for package @openagenda/react-shared

### [2.0.3](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.2...@openagenda/react-shared@2.0.3) (2020-07-06)

### Bug Fixes

- **react-shared:** displays stringified value for avoid react error ([5509609](https://github.com/OpenAgenda/oa/commit/55096099df72d9589cad5768191b7815fd7d1ecf))
- **react-shared:** fix ReactSelectField ([bc286f1](https://github.com/OpenAgenda/oa/commit/bc286f1349ad9ce3a653d311408169a03d8d5811))
- **react-shared:** ReactSelectField works with categories ([90e5f4a](https://github.com/OpenAgenda/oa/commit/90e5f4a0eee8557edb70d35af1ab604fcf1c8423))

### [2.0.2](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.1...@openagenda/react-shared@2.0.2) (2020-06-18)

**Note:** Version bump only for package @openagenda/react-shared

### [2.0.1](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@2.0.0...@openagenda/react-shared@2.0.1) (2020-06-09)

### Performance Improvements

- **react-shared:** improve hooks ([fa52a56](https://github.com/OpenAgenda/oa/commit/fa52a56b217bdb0726f7b3748b32f58fff6dcffe))

## [2.0.0](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@1.1.0...@openagenda/react-shared@2.0.0) (2020-05-22)

### ⚠ BREAKING CHANGES

- **react-shared:** rename creatable prop to isCreatable

### Code Refactoring

- **react-shared:** rename creatable prop to isCreatable ([db14fc3](https://github.com/OpenAgenda/oa/commit/db14fc3ea00cd94c657c07f16d029ce30f78b3ed))

## [1.1.0](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@1.0.2...@openagenda/react-shared@1.1.0) (2020-05-15)

### Features

- **react-shared:** add ApiClientContext and useApiClient ([7af942d](https://github.com/OpenAgenda/oa/commit/7af942dfc592de48e6e6b99e3987cc723cb8fbca))
- **react-shared:** add ReactSelectInput and ReactSelectField ([cf59e39](https://github.com/OpenAgenda/oa/commit/cf59e3995f8dbbf59e3e43e6fb3ca1567ec04520))
- **react-shared:** add Switch and Case ([72ffd17](https://github.com/OpenAgenda/oa/commit/72ffd17dff87da51cf349392f22c2c16c9791456))
- **react-shared:** add useConstant hook ([faefffd](https://github.com/OpenAgenda/oa/commit/faefffd5a75d5026ea75adeee7033609d15f7152))
- **react-shared:** add useModal hook ([f5363d0](https://github.com/OpenAgenda/oa/commit/f5363d0af17e08e3d0c521b2a26b22e084269dda))
- **react-shared:** move styles from ReactSelectField to ReactSelectInput ([ab0624e](https://github.com/OpenAgenda/oa/commit/ab0624e231a13a21444eea6ae255a10bc109d056))

### [1.0.2](https://github.com/OpenAgenda/oa/compare/@openagenda/react-shared@1.0.1...@openagenda/react-shared@1.0.2) (2020-04-07)

### Bug Fixes

- **react-shared:** fix oa:extract-messages bin ([eb4e0f1](https://github.com/OpenAgenda/oa/commit/eb4e0f1f0980052055f1525e9e9f0b3261df461d))

## <small>1.0.1 (2020-04-03)</small>

- fix(react-shared): fix oa:extract-messages script ([ee18b7b](https://github.com/OpenAgenda/oa/commit/ee18b7b))
- fix builds on Yarn 2 ([f4723be](https://github.com/OpenAgenda/oa/commit/f4723be))
- fix deps ([71703f8](https://github.com/OpenAgenda/oa/commit/71703f8))
- fix linting ([90ad3dc](https://github.com/OpenAgenda/oa/commit/90ad3dc))
- lint ([940c95d](https://github.com/OpenAgenda/oa/commit/940c95d))
- lint and prettier ([b1dbbc0](https://github.com/OpenAgenda/oa/commit/b1dbbc0))
- merge resolution ([5a9cb4d](https://github.com/OpenAgenda/oa/commit/5a9cb4d))
- move script extract-messages in react-shared ([ff33b5a](https://github.com/OpenAgenda/oa/commit/ff33b5a))
- react-shared: add eslint comment ([9230c60](https://github.com/OpenAgenda/oa/commit/9230c60))
- react-shared: fix useMemoOne ([9b3eb0d](https://github.com/OpenAgenda/oa/commit/9b3eb0d))
- react-shared: initial commit ([1cb87cf](https://github.com/OpenAgenda/oa/commit/1cb87cf))
- react-timingspicker: translate ([869d7ce](https://github.com/OpenAgenda/oa/commit/869d7ce))
- upgrade babel ([444b969](https://github.com/OpenAgenda/oa/commit/444b969))
- upgrade jest and core-js ([21c2768](https://github.com/OpenAgenda/oa/commit/21c2768))
- upgrade some deps ([33a049a](https://github.com/OpenAgenda/oa/commit/33a049a))
