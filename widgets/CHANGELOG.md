# @openagenda/widgets

## 0.2.0

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

### Patch Changes

- [#281](https://github.com/OpenAgenda/oa/pull/281) [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Storybook from 10.2 to 10.5.7, along with `@storybook/react-webpack5`, `@storybook/html-vite` and `@storybook/addon-webpack5-compiler-babel` (4.0.0 to 4.0.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  All of these were already on `^10.2.0` carets that permitted 10.5.7, so the resolved version was the only thing lagging; the declarations now state what is installed.

- [#270](https://github.com/OpenAgenda/oa/pull/270) [`903ab34`](https://github.com/OpenAgenda/oa/commit/903ab34745418c627c13cc126a0016bd6a49c84b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Align the build toolchain with the versions `@openagenda/agenda-portal` moved to, so the monorepo resolves a single copy of each. Build-time dependencies only — no runtime or API change — but the published bundles are produced by a newer webpack.

  `webpack` 5.89 → 5.109, `webpack-cli` 5 → 7, `sass` 1.69/1.83 → 1.102, `sass-loader` 10 → 17, `babel-loader` 9 → 10, `webpackbar` 5.0.0-3 → 7, `terser-webpack-plugin` → 5.6.1, `source-map-loader` 2 → 5, `style-loader` → 4.

  `webpackbar` was the blocker: the 5.0.0-3 prerelease passes options that webpack 5.109's tightened `ProgressPlugin` schema rejects, which broke the build outright. In `@openagenda/react-filters` the progress bar sits behind `process.stdout.isTTY`, so this would have failed in a developer's terminal while CI stayed green.

  `@openagenda/react-filters` also gains an explicit `style-loader` devDependency: its Storybook config used the loader while relying on it being hoisted from another workspace.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1), [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7), [`903ab34`](https://github.com/OpenAgenda/oa/commit/903ab34745418c627c13cc126a0016bd6a49c84b), [`5b06981`](https://github.com/OpenAgenda/oa/commit/5b06981f2da0f07a29b37fc299da6bcb47f6db97), [`7501a67`](https://github.com/OpenAgenda/oa/commit/7501a677b9bd5e4d41406be9fb7e63c7352dd845), [`570c34b`](https://github.com/OpenAgenda/oa/commit/570c34ba1b093196268e309f6745f0fad080869b), [`c4d6c54`](https://github.com/OpenAgenda/oa/commit/c4d6c54a406a317f288717ec55dcd2f20c01867e), [`09ae437`](https://github.com/OpenAgenda/oa/commit/09ae437830b446aa963e8ea6bd3461a6b454c68b)]:
  - @openagenda/react-filters@3.0.0
  - @openagenda/react@0.2.0
  - @openagenda/uikit@0.3.0

## 0.1.2

### Patch Changes

- [#254](https://github.com/OpenAgenda/oa/pull/254) [`83d94de`](https://github.com/OpenAgenda/oa/commit/83d94de32bb3bb07674bb94849c2b64c94f20f55) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Version bump to re-trigger the CDN upload, which only runs when widgets is actually published. `scripts/upload.sh` was resolving `swift` to the Swift language toolchain shipped on GitHub runners instead of python-swiftclient.

## 0.1.1

### Patch Changes

- [#252](https://github.com/OpenAgenda/oa/pull/252) [`833b727`](https://github.com/OpenAgenda/oa/commit/833b7277691b73654090472783d0c6acd7074fef) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Surface the actual Swift error when the CDN upload cannot authenticate. `scripts/upload.sh` discarded `swift stat`'s stderr, so a credential problem surfaced only as "Impossible de se connecter à OpenStack Swift" with no way to tell an expired credential from an empty one. The failure path now prints Swift's own message along with the names of the loaded `OS_*` variables — names only, and only on failure, since a successful `swift stat` exposes the account's `Meta Temp-Url-Key`.

## 0.1.0

### Minor Changes

- [#164](https://github.com/OpenAgenda/oa/pull/164) [`bc7116d`](https://github.com/OpenAgenda/oa/commit/bc7116dd721c8670a33c889b28578b7987942b9b) Thanks [@clement180](https://github.com/clement180)! - Add a "horizontal cards" layout option to the agenda embed.

  - `@openagenda/widgets`: the `oa-agenda` blockquote now accepts a `data-item-layout="horizontal"` attribute, forwarded as the `itemLayout` query param to the embed iframe.
  - `@openagenda/react`: the agenda export modal exposes a checkbox to generate the `data-item-layout="horizontal"` snippet.

  Horizontal cards render image-left / content-right (stacking on narrow widths) in a single full-width column.

### Patch Changes

- Updated dependencies [[`bc7116d`](https://github.com/OpenAgenda/oa/commit/bc7116dd721c8670a33c889b28578b7987942b9b), [`6a8c4a7`](https://github.com/OpenAgenda/oa/commit/6a8c4a796de656b7809c32c91a7bade52384a2f5), [`c70935e`](https://github.com/OpenAgenda/oa/commit/c70935ec5f6cb62d0e2bf823c47e6a5c823be969), [`6554727`](https://github.com/OpenAgenda/oa/commit/6554727ba5f4aa47751a382490131477c3afc7e3)]:
  - @openagenda/react@0.1.0
  - @openagenda/react-filters@2.13.8
  - @openagenda/uikit@0.2.0

## 0.0.4

### Patch Changes

- [#168](https://github.com/OpenAgenda/oa/pull/168) [`eb6ee10`](https://github.com/OpenAgenda/oa/commit/eb6ee10ca6b05737575dd7fef467ce59827602a1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Automate the CDN deployment of the widgets bundle on release. The release workflow now uploads the freshly built `dist/` to the OpenStack Swift `js` container and purges the KeyCDN `assets` zone whenever `@openagenda/widgets` is published, reusing `scripts/upload.sh` (made CI-aware: KeyCDN key and Swift credentials come from the environment, with the 1Password path kept as the local fallback).

- Updated dependencies []:
  - @openagenda/react@0.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/uikit@0.1.0
  - @openagenda/react@0.0.5
  - @openagenda/react-filters@2.13.7

## 0.0.2

### Patch Changes

- Updated dependencies [[`243515b`](https://github.com/OpenAgenda/oa/commit/243515b8959b3182bc3e150b2d6a05e86068ac5c)]:
  - @openagenda/react@0.0.4

## 0.0.1

### Patch Changes

- [`f8e13d3`](https://github.com/OpenAgenda/oa/commit/f8e13d33049d1e754ee3ec3750d9723ac6c6ed73) Thanks [@bertho-zero](https://github.com/bertho-zero)! - add AgendaExportModal

- Updated dependencies [[`515a140`](https://github.com/OpenAgenda/oa/commit/515a140a8f56cebbe654a85afb3de2b6098322a3), [`ae1ea12`](https://github.com/OpenAgenda/oa/commit/ae1ea12c045351b375e7eddc6ea46a2d95dc735f), [`bfacacd`](https://github.com/OpenAgenda/oa/commit/bfacacdfb0d37bf82be9241e9690265db4a59a2e), [`a1f2728`](https://github.com/OpenAgenda/oa/commit/a1f2728cbb913dd2a0c2b98bb28d7856543195e4)]:
  - @openagenda/uikit@0.0.3
  - @openagenda/react-filters@2.13.2
  - @openagenda/react@0.0.3
