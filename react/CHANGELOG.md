# @openagenda/react

## 0.2.0

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

### Patch Changes

- [#281](https://github.com/OpenAgenda/oa/pull/281) [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Storybook from 10.2 to 10.5.7, along with `@storybook/react-webpack5`, `@storybook/html-vite` and `@storybook/addon-webpack5-compiler-babel` (4.0.0 to 4.0.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  All of these were already on `^10.2.0` carets that permitted 10.5.7, so the resolved version was the only thing lagging; the declarations now state what is installed.

- [#437](https://github.com/OpenAgenda/oa/pull/437) [`c4d6c54`](https://github.com/OpenAgenda/oa/commit/c4d6c54a406a317f288717ec55dcd2f20c01867e) Thanks [@kaore](https://github.com/kaore)! - The PDF section of `AgendaExportModal` lets the user choose what each event carries: the image, the short description, the accessibility icons, the location details, the registration details (links, emails, phone numbers) and the link to the event page on OpenAgenda, all on by default; the title and the dates are shown as always included. Leaving something out adds an `includeFields[]` list to the export URL, the same parameter the other exports use. The image box is greyed out, unchecked, when the export covers more events than the server threshold (`pdfImageLimit` from the export settings), since the export drops images past it anyway.

- [#422](https://github.com/OpenAgenda/oa/pull/422) [`09ae437`](https://github.com/OpenAgenda/oa/commit/09ae437830b446aa963e8ea6bd3461a6b454c68b) Thanks [@kaore](https://github.com/kaore)! - Ask the event PDF export for the language the reader picked. The share modal's
  "Download PDF" link now carries `?lang=<contentLocale>`, the same content
  language the modal already hands the calendar and social-network links.

  Without it the web `/api` mount fell back to `req.lang` — the reader's own
  culture, or `fr` — so a multilingual event displayed in one language exported as
  a PDF in another. The renderer picks both its content and its labels from that single
  `lang`, so the document now reads end to end in the chosen language.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1), [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7), [`7979599`](https://github.com/OpenAgenda/oa/commit/7979599f1c39658f6f20a49c09eaeebf706a27f9), [`903ab34`](https://github.com/OpenAgenda/oa/commit/903ab34745418c627c13cc126a0016bd6a49c84b), [`ffc274e`](https://github.com/OpenAgenda/oa/commit/ffc274eab4d1173d5f5463b6db345cfc47383fb8), [`8ec6dc2`](https://github.com/OpenAgenda/oa/commit/8ec6dc23471a3b60fb14fedad7bf647741c071b5), [`e583f34`](https://github.com/OpenAgenda/oa/commit/e583f343fbe1109c7c311f1df82a3fb28541b2ad), [`5b06981`](https://github.com/OpenAgenda/oa/commit/5b06981f2da0f07a29b37fc299da6bcb47f6db97), [`7501a67`](https://github.com/OpenAgenda/oa/commit/7501a677b9bd5e4d41406be9fb7e63c7352dd845), [`570c34b`](https://github.com/OpenAgenda/oa/commit/570c34ba1b093196268e309f6745f0fad080869b), [`a5214af`](https://github.com/OpenAgenda/oa/commit/a5214afb4357242e5b65490b13e87547fe590e07)]:
  - @openagenda/mails@6.0.3
  - @openagenda/react-filters@3.0.0
  - @openagenda/react-shared@3.1.0
  - @openagenda/uikit@0.3.0
  - @openagenda/common-labels@2.0.1

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
