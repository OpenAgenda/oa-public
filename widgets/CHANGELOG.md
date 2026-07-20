# @openagenda/widgets

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
