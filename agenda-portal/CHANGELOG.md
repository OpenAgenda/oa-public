# Change Log

## 7.0.0

### Major Changes

- [#269](https://github.com/OpenAgenda/oa/pull/269) [`56b8f61`](https://github.com/OpenAgenda/oa/commit/56b8f61580f6cde92c9d4cf57cd14b6a91945703) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Update the whole webpack toolchain to its latest majors and declare the Node floor it implies.

  **Breaking — Node >= 22.15.0 is now required** (`engines` field added, previously absent). This is the floor imposed by `webpack-dev-server` 6; `webpack-cli` 7 and `webpack-dev-middleware` 8 require >= 20.9. Node 20 reached end of life in April 2026.

  Bumped: `webpack` 5.89 → 5.109, `webpack-cli` 5 → 7, `webpack-dev-server` 4 → 6, `webpack-dev-middleware` 4 → 8, `webpack-hot-middleware` → 2.26, `sass` 1.69 → 1.102, `sass-loader` 12 → 17, `babel-loader` 9 → 10, `css-minimizer-webpack-plugin` 5 → 8, `copy-webpack-plugin` 13 → 14, `mini-css-extract-plugin` → 2.10, `css-loader` → 7.1.4, `string-replace-loader` → 3.3.

  No portal-facing configuration change is needed: the `devServer` options in use (`port`, `headers`, `compress`) are unchanged in v6, `webpack serve --hot` still works, and `webpack-dev-middleware`'s `publicPath` option is still supported. `sass-loader` 17 drops the legacy Sass JS API, but the SCSS chain (`resolve-url-loader` included) compiles unchanged on the modern API.

  Stop compilation warnings from taking over the browser in dev. `sass-loader`'s legacy API reported Sass deprecations through webpack's infrastructure logging (terminal only); the modern API emits them as real module warnings, so the 52 deprecations Bootstrap 4 and our own `@import`s produce started covering the portal with a full-screen dev-server overlay on every rebuild. The overlay is now scoped to `{ errors: true, warnings: false, runtimeErrors: true }` — warnings remain fully reported in the terminal, they just no longer hide the page. Errors and runtime errors still take over the screen.

  Also fix the one deprecation that was actually ours: `darken()` → `color.adjust()` in `boot/sass/_header.scss`.

  Note that `sass` 1.102 serializes some computed colors as `rgb(90%, 90%, 90%)` where 1.69 emitted hex. This is cosmetic and renders identically; `darken()` and `color.adjust()` were verified to produce byte-identical output.

  Removed two dependencies:

  - `style-loader`, which was declared but referenced nowhere — the CSS chain goes through `MiniCssExtractPlugin.loader`.
  - `clean-webpack-plugin`, unmaintained and peer-capped at `webpack < 6`, replaced by webpack's built-in `output.clean` (already used by `bin/webpack.server.js`).

  Pin `experiments.typescript` off in the four shipped webpack configs. Left on its `"auto"` default, webpack enables its built-in TypeScript support on Node >= 22.6, which activates enhanced-resolve's `TsconfigPathsPlugin`; that plugin walks up the tree and hard-fails on the `tsconfig.json` shipped by several transitive dependencies (`side-channel`, `hasown`, `es-set-tostringtag`) whose `extends` target is a devDependency that is never installed. Pinning it off also makes builds identical across the Node versions portals run on.

  As a side effect, `bundle-server` no longer fails to minify an `i18n/index.js` that uses import attributes (`with { type: 'json' }`).

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

### Patch Changes

- [#321](https://github.com/OpenAgenda/oa/pull/321) [`895171d`](https://github.com/OpenAgenda/oa/commit/895171d0fcfbe2b25241698a161e24d23ad67e8a) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Import the `@openagenda/react-filters` stylesheet from `sass/main.scss`. That package stopped injecting its rules at runtime, so the filters would otherwise render unstyled.

  **A portal with its own sass file has to add the same line**, after bootstrap:

  ```scss
  @import '@openagenda/react-filters/style';
  ```

  It sits after bootstrap because those rules overrule `.btn`, `.badge` and `.form-control` by source order rather than by specificity — the position emotion used to hold at runtime, so existing overrides keep working.

- [#282](https://github.com/OpenAgenda/oa/pull/282) [`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Jest from 29.7 to 30.4.2, along with `babel-jest`, `@jest/globals` and `jest-environment-jsdom` (30.4.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  Jest 30 supports `import.meta.filename` and `import.meta.dirname` natively, so the local patch these packages relied on (`jest-runtime@29.7.0`) is removed along with its `resolutions` entry.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`adf3653`](https://github.com/OpenAgenda/oa/commit/adf36534bde6e3590951e0b27649fb04e5c27e61), [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1), [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7), [`903ab34`](https://github.com/OpenAgenda/oa/commit/903ab34745418c627c13cc126a0016bd6a49c84b), [`ffc274e`](https://github.com/OpenAgenda/oa/commit/ffc274eab4d1173d5f5463b6db345cfc47383fb8), [`8ec6dc2`](https://github.com/OpenAgenda/oa/commit/8ec6dc23471a3b60fb14fedad7bf647741c071b5), [`5aafa09`](https://github.com/OpenAgenda/oa/commit/5aafa0995e9a91b4df187536c559610121dc8c44), [`75e2a2f`](https://github.com/OpenAgenda/oa/commit/75e2a2f48a5ba8f8cffa925ce608b6e70ddc337c), [`5b06981`](https://github.com/OpenAgenda/oa/commit/5b06981f2da0f07a29b37fc299da6bcb47f6db97), [`7501a67`](https://github.com/OpenAgenda/oa/commit/7501a677b9bd5e4d41406be9fb7e63c7352dd845), [`570c34b`](https://github.com/OpenAgenda/oa/commit/570c34ba1b093196268e309f6745f0fad080869b), [`a5214af`](https://github.com/OpenAgenda/oa/commit/a5214afb4357242e5b65490b13e87547fe590e07)]:
  - @openagenda/logs@1.2.2
  - @openagenda/md@2.0.2
  - @openagenda/react-filters@3.0.0
  - @openagenda/react-shared@3.1.0
  - @openagenda/intl@2.1.0
  - @openagenda/react-portal-ssr@1.2.0
  - @openagenda/babel-preset@2.0.1

## 6.15.2

### Patch Changes

- [#173](https://github.com/OpenAgenda/oa/pull/173) [`ef2fdf1`](https://github.com/OpenAgenda/oa/commit/ef2fdf19ab621355e8b7d64c9861ddbf272d375f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Fix the release pipeline for `@openagenda/agenda-portal`. The `publish` script was a self-referential npm lifecycle hook: `npm publish` uploads the tarball and _then_ runs the package's `publish` script, which called `yarn npm publish` again on the just-published version — failing with a version conflict and marking the release job as failed (even though the package had already been published, leaving the git tag and GitHub release missing). The production dependency build now lives in `prepublishOnly`, which runs _before_ packing (so it actually influences the tarball) and only on publish (so local `prepack` / `yarn pack` stays in dev), with no recursive double-publish.

- [#219](https://github.com/OpenAgenda/oa/pull/219) [`550bcfc`](https://github.com/OpenAgenda/oa/commit/550bcfcaddae3b773815e04aa5c49cfeee9c3e1a) Thanks [@kaore](https://github.com/kaore)! - Bump `validator` to `^13.15.22` (resolves 13.15.35) to remediate a high-severity advisory (incomplete filtering of special elements, `< 13.15.22`) plus medium `isURL` bypass and ReDoS advisories. Only `isEmail`, `isURL` and `isIP` (deep-imported from `validator/lib/*`) are used across the affected packages; all three behave correctly in v13 for representative inputs. `agenda-portal` declares validator but has no direct usage, so this is a lockfile-level bump for it.

- [#226](https://github.com/OpenAgenda/oa/pull/226) [`6554727`](https://github.com/OpenAgenda/oa/commit/6554727ba5f4aa47751a382490131477c3afc7e3) Thanks [@kaore](https://github.com/kaore)! - Bump `express` to `^4.21.2` (and `body-parser` to `^1.20.3` where declared) to
  remediate the `body-parser` url-encoded request DoS and the `path-to-regexp`
  route-matching ReDoS carried by express 4.18.x. First-party dependency bumps,
  no `resolutions` overrides.
- Updated dependencies [[`6a8c4a7`](https://github.com/OpenAgenda/oa/commit/6a8c4a796de656b7809c32c91a7bade52384a2f5), [`31c43a7`](https://github.com/OpenAgenda/oa/commit/31c43a7c75fce44e065f642700b8d8ee593c47c3), [`6554727`](https://github.com/OpenAgenda/oa/commit/6554727ba5f4aa47751a382490131477c3afc7e3)]:
  - @openagenda/react-filters@2.13.8
  - @openagenda/md@2.0.1
  - @openagenda/react-shared@3.0.1

## 6.15.1

### Patch Changes

- Updated dependencies [[`a3bd9bd`](https://github.com/OpenAgenda/oa/commit/a3bd9bd75ac41e5f5c62bc7e43efcd8b376ffa99)]:
  - @openagenda/logs@1.2.1

## 6.15.0

### Minor Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Brand update: primary color switches from `#41acdd` to `#1d77ce`. The consent banner is imported through the `@openagenda/react-shared` bare specifier (compatible with its new exports map), and the client bundles are rebuilt with `react-intl` 10 and React 19.2.

### Patch Changes

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/babel-preset@2.0.0
  - @openagenda/browserslist-config@2.0.0
  - @openagenda/intl@2.0.0
  - @openagenda/logs@1.2.0
  - @openagenda/md@2.0.0
  - @openagenda/react-portal-ssr@1.1.0
  - @openagenda/react-shared@3.0.0
  - @openagenda/react-filters@2.13.7

## 6.14.0

### Minor Changes

- [`f183e7f`](https://github.com/OpenAgenda/oa/commit/f183e7fc53521859d2bf78dc06aafcd021117a27) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add an option `includeFields` to reduce size of event list.

## 6.12.6

### Patch Changes

- [`ae1ea12`](https://github.com/OpenAgenda/oa/commit/ae1ea12c045351b375e7eddc6ea46a2d95dc735f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Fix build

- [`69a073b`](https://github.com/OpenAgenda/oa/commit/69a073b0ae438c653633319ecc8ad84d2f02087e) Thanks [@kaore](https://github.com/kaore)! - refactor relative path util

- Updated dependencies [[`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f), [`ae1ea12`](https://github.com/OpenAgenda/oa/commit/ae1ea12c045351b375e7eddc6ea46a2d95dc735f)]:
  - @openagenda/intl@1.1.6
  - @openagenda/react-filters@2.13.2
  - @openagenda/react-shared@2.4.5

## 6.12.5

### Patch Changes

- Updated dependencies [[`9130206`](https://github.com/OpenAgenda/oa/commit/9130206f01c7b004965a026e357974f68c5d4dc9), [`507cf12`](https://github.com/OpenAgenda/oa/commit/507cf127fef88e6c4e902cc8064fdff47d268c83), [`3cef30d`](https://github.com/OpenAgenda/oa/commit/3cef30d15f26a2f2bf267941b80a7bd3fd27f560)]:
  - @openagenda/logs@1.1.10
  - @openagenda/md@1.0.1
  - @openagenda/react-filters@2.13.1
  - @openagenda/react-shared@2.4.4

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [2.12.4](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.12.3...@openagenda/agenda-portal@2.12.4) (2020-07-16)

### Bug Fixes

- **agenda-portal:** relative and same domain links are not always read as internal ([fb1af22](https://github.com/OpenAgenda/oa/commit/fb1af22e9a8bf660173346201f368a28fd5525bd))

### [2.12.3](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.12.2...@openagenda/agenda-portal@2.12.3) (2020-07-13)

### Bug Fixes

- **agenda-portal:** IE11 fix for iframable ([0d8feb5](https://github.com/OpenAgenda/oa/commit/0d8feb5413afddb6aee44c33b572229e59d61506))

### [2.12.2](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.12.1...@openagenda/agenda-portal@2.12.2) (2020-07-13)

### Bug Fixes

- **agenda-portal:** using minified version of jquery.spin.js ([e11293a](https://github.com/OpenAgenda/oa/commit/e11293a920a763373feb54f014c6e4839fa62002))

### [2.12.1](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.12.0...@openagenda/agenda-portal@2.12.1) (2020-07-10)

### Bug Fixes

- **agenda-portal:** digestible error for non member users ([cbf9ec7](https://github.com/OpenAgenda/oa/commit/cbf9ec73a1662e9d6e94b7692229fed43f415a22))

## [2.12.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.11.1...@openagenda/agenda-portal@2.12.0) (2020-07-10)

### Features

- **agenda-portal:** allow for scroll offset in iframe mode ([38e26ce](https://github.com/OpenAgenda/oa/commit/38e26ce16a11109c967745859c7fd80d53870662))

### Bug Fixes

- fix links in changelogs ([84e2460](https://github.com/OpenAgenda/oa/commit/84e24609981f4ee3bb9e34ef52109d74abe97a62))

### [2.11.1](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.11.0...@openagenda/agenda-portal@2.11.1) (2020-07-09)

### Bug Fixes

- **agenda-portal:** specifying .env file should be optional ([db61b61](https://github.com/OpenAgenda/oa/commit/db61b61ba52d5e7d2b42f50c810dbbf3af17dd7f))

## [2.11.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.10.0...@openagenda/agenda-portal@2.11.0) (2020-07-09)

### Features

- **agenda-portal:** specify preview widget target through iframe attribute ([54ef64e](https://github.com/OpenAgenda/oa/commit/54ef64ee2afcd9862056229a961050a382a861bd))

## [2.10.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.9.3...@openagenda/agenda-portal@2.10.0) (2020-07-08)

### Features

- **agenda-portal:** preview widget added ([e30e435](https://github.com/OpenAgenda/oa/commit/e30e4351446d636328e41af2ec43d33ca6113092))
- **agenda-portal:** use .env to store project variables ([5af51bb](https://github.com/OpenAgenda/oa/commit/5af51bb7347b78c813a2dd21eabbafda4a7a1bdc))

### Bug Fixes

- **agenda-portal:** in iframed portal, when event is opened in list, scrolls back to top of iframe ([b4a73a2](https://github.com/OpenAgenda/oa/commit/b4a73a228e02369af4a3499335cfd337a7adea54))

### [2.9.3](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.9.2...@openagenda/agenda-portal@2.9.3) (2020-07-06)

**Note:** Version bump only for package @openagenda/agenda-portal

### [2.9.2](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.9.1...@openagenda/agenda-portal@2.9.2) (2020-06-30)

### Bug Fixes

- **agenda-portal:** map widget zoom in and out control triggers scroll to top in parent frame ([8d4ce03](https://github.com/OpenAgenda/oa/commit/8d4ce03919b2777f7fb72a09bbe3f51173de64a3))

### [2.9.1](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.9.0...@openagenda/agenda-portal@2.9.1) (2020-06-18)

### Bug Fixes

- **agenda-portal:** babel does not transpile scripts in node_modules in deployed projects ([23adfb5](https://github.com/OpenAgenda/oa/commit/23adfb50112b1e511a1c2567e9755816b9cb799d))

## [2.9.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.8.0...@openagenda/agenda-portal@2.9.0) (2020-06-09)

### Features

- **agenda-portal:** links pointing to other website in iframed portal are handled by iframe controller ([cfca57f](https://github.com/OpenAgenda/oa/commit/cfca57f30a76e7b8d00b031ca185b545f22976d9))

## [2.8.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.7.0...@openagenda/agenda-portal@2.8.0) (2020-05-22)

### Features

- **agenda-portal:** pageProps mechanism to pass init config to frontend scripts, locale bugfix ([a307333](https://github.com/OpenAgenda/oa/commit/a3073333b6f2725ea89654f37b23e71486885b57))

## [2.7.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.6.0...@openagenda/agenda-portal@2.7.0) (2020-05-19)

### Features

- **agenda-portal:** added utilities and documentation ([02b9c98](https://github.com/OpenAgenda/oa/commit/02b9c9863d53aa0f9934ea5d1971440df71cf85a))
- **agenda-portal:** util to transform v1 query to v2. Date filter only ([285402d](https://github.com/OpenAgenda/oa/commit/285402d1ee1eabee605ed90112e4aea129750eaa))

## [2.6.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.5.2...@openagenda/agenda-portal@2.6.0) (2020-05-15)

### Features

- **agenda-portal:** added event transform utilities ([2daa1b7](https://github.com/OpenAgenda/oa/commit/2daa1b75d25b72e8b0c9960b7b460c0874e8a40e))

### Bug Fixes

- does not use global moment locale ([95101c3](https://github.com/OpenAgenda/oa/commit/95101c3bade5aa224003d3ec716571548aeb0d97))

### [2.5.2](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.5.1...@openagenda/agenda-portal@2.5.2) (2020-04-09)

### Bug Fixes

- **agenda-portal:** navigation.available is null if neither prev or next are available ([a20a1bf](https://github.com/OpenAgenda/oa/commit/a20a1bfb90935f310c63dd8760c0a69f54664a15))

### [2.5.1](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.5.0...@openagenda/agenda-portal@2.5.1) (2020-04-09)

### Bug Fixes

- **agenda-portal:** .? synthax is not recognized ([0ffca9e](https://github.com/OpenAgenda/oa/commit/0ffca9eab350e5c6bfcd9ed3de47df90ff2f0071))

## [2.5.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.4.8...@openagenda/agenda-portal@2.5.0) (2020-04-08)

### Features

- **agenda-portal:** compress css at launch ([ffe2479](https://github.com/OpenAgenda/oa/commit/ffe2479e010bde6a1589964c46cb7769453e5836))

### [2.4.8](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.4.7...@openagenda/agenda-portal@2.4.8) (2020-04-07)

**Note:** Version bump only for package @openagenda/agenda-portal

## <small>2.4.7 (2020-04-03)</small>

- revert(agenda-portal): test changelog ([6e4c96d](https://github.com/OpenAgenda/oa/commit/6e4c96d))

## [2.4.6](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.4.5...@openagenda/agenda-portal@2.4.6) (2020-04-03)

### Reverts

- **agenda-portal:** reverts "add brackets in searchQuery" ([283b656](https://github.com/OpenAgenda/oa/commit/283b656777f40f14c28310070f645b4604e6b1a5))

## [2.4.5](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-portal@2.4.4...@openagenda/agenda-portal@2.4.5) (2020-04-03)

**Note:** Version bump only for package @openagenda/agenda-portal

## <small>2.4.4 (2020-04-03)</small>

- revert(agenda-portal): reverts "add brackets in searchQuery" ([3c36ba7](https://github.com/OpenAgenda/oa/commit/3c36ba7))

## <small>2.4.3 (2020-04-03)</small>

- style(agenda-portal): add brackets in searchQuery ([faceaed](https://github.com/OpenAgenda/oa/commit/faceaed))

## <small>2.4.2 (2020-04-03)</small>

- fix builds on Yarn 2 ([f4723be](https://github.com/OpenAgenda/oa/commit/f4723be))
- fix deps ([71703f8](https://github.com/OpenAgenda/oa/commit/71703f8))
- fix webpack-dev-server ([d874a0b](https://github.com/OpenAgenda/oa/commit/d874a0b))
- lint and prettier ([b1dbbc0](https://github.com/OpenAgenda/oa/commit/b1dbbc0))
- Merge branch 'master' of bitbucket.org:openagenda/oa into yarn-2 ([775a472](https://github.com/OpenAgenda/oa/commit/775a472))
- use the same lodash ([aeae186](https://github.com/OpenAgenda/oa/commit/aeae186))
