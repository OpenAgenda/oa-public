# @openagenda/widgets

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
