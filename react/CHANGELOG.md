# @openagenda/react

## 0.1.0

### Minor Changes

- [#164](https://github.com/OpenAgenda/oa/pull/164) [`bc7116d`](https://github.com/OpenAgenda/oa/commit/bc7116dd721c8670a33c889b28578b7987942b9b) Thanks [@clement180](https://github.com/clement180)! - Add a "horizontal cards" layout option to the agenda embed.

  - `@openagenda/widgets`: the `oa-agenda` blockquote now accepts a `data-item-layout="horizontal"` attribute, forwarded as the `itemLayout` query param to the embed iframe.
  - `@openagenda/react`: the agenda export modal exposes a checkbox to generate the `data-item-layout="horizontal"` snippet.

  Horizontal cards render image-left / content-right (stacking on narrow widths) in a single full-width column.

### Patch Changes

- Updated dependencies [[`3289677`](https://github.com/OpenAgenda/oa/commit/328967740603fbce95ffc1b7288758171c31d662), [`6a8c4a7`](https://github.com/OpenAgenda/oa/commit/6a8c4a796de656b7809c32c91a7bade52384a2f5), [`c70935e`](https://github.com/OpenAgenda/oa/commit/c70935ec5f6cb62d0e2bf823c47e6a5c823be969), [`6554727`](https://github.com/OpenAgenda/oa/commit/6554727ba5f4aa47751a382490131477c3afc7e3)]:
  - @openagenda/mails@6.0.2
  - @openagenda/react-filters@2.13.8
  - @openagenda/uikit@0.2.0
  - @openagenda/react-shared@3.0.1

## 0.0.6

### Patch Changes

- Updated dependencies []:
  - @openagenda/mails@6.0.1

## 0.0.5

### Patch Changes

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/common-labels@2.0.0
  - @openagenda/mails@6.0.0
  - @openagenda/react-shared@3.0.0
  - @openagenda/uikit@0.1.0
  - @openagenda/react-filters@2.13.7

## 0.0.4

### Patch Changes

- [#136](https://github.com/OpenAgenda/oa/pull/136) [`243515b`](https://github.com/OpenAgenda/oa/commit/243515b8959b3182bc3e150b2d6a05e86068ac5c) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Align `@openagenda/mails` on the workspace major (`^5.0.0`). The only consumed
  entry point is `extractEmails`, byte-identical between 4.0.2 and 5.0.0 — the
  major only replaced `@openagenda/queues` with bullmq, an unrelated surface.

## 0.0.3

### Patch Changes

- [`a1f2728`](https://github.com/OpenAgenda/oa/commit/a1f2728cbb913dd2a0c2b98bb28d7856543195e4) Thanks [@bertho-zero](https://github.com/bertho-zero)! - update AgendaExportModal

- Updated dependencies [[`515a140`](https://github.com/OpenAgenda/oa/commit/515a140a8f56cebbe654a85afb3de2b6098322a3), [`ae1ea12`](https://github.com/OpenAgenda/oa/commit/ae1ea12c045351b375e7eddc6ea46a2d95dc735f), [`bfacacd`](https://github.com/OpenAgenda/oa/commit/bfacacdfb0d37bf82be9241e9690265db4a59a2e)]:
  - @openagenda/uikit@0.0.3
  - @openagenda/react-filters@2.13.2
  - @openagenda/react-shared@2.4.5

## 0.0.2

### Patch Changes

- Updated dependencies [[`3cef30d`](https://github.com/OpenAgenda/oa/commit/3cef30d15f26a2f2bf267941b80a7bd3fd27f560), [`9cc12d5`](https://github.com/OpenAgenda/oa/commit/9cc12d5d9ae2d722b793dc2287423ca6da1a4e4f)]:
  - @openagenda/react-filters@2.13.1
  - @openagenda/uikit@0.0.2
  - @openagenda/react-shared@2.4.4

## 0.0.1

### Patch Changes

- [`45ebd94`](https://github.com/OpenAgenda/oa/commit/45ebd94e8c37dc2726c65332adae4e53d9515a63) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add AgendaExportModal
