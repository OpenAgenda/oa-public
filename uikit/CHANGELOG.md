# @openagenda/uikit

## 0.6.0

### Minor Changes

- [#854](https://github.com/OpenAgenda/oa/pull/854) [`950b971`](https://github.com/OpenAgenda/oa/commit/950b971205da5df2f1e827862e3af7429c6f6702) Thanks [@kaore](https://github.com/kaore)! - Corners are discreet at every level: the semantic radii `l1`, `l2` and `l3` all
  take the small radius of the legacy pages, so dialogs, buttons, fields, selects,
  tooltips, checkboxes, tags and alerts lose Chakra's growing roundness. This
  reaches every consumer of the theme: `@openagenda/react` (agenda export and
  event share modals, `SearchInput`, tooltips), `@openagenda/widgets` (the same
  modals opened from widgets embedded on third-party sites), the supervisor and
  the Next app. `Surface` takes a `note` variant, a neutral bordered box for
  information set inside a page or a dialog.

- [#819](https://github.com/OpenAgenda/oa/pull/819) [`9b5b7be`](https://github.com/OpenAgenda/oa/commit/9b5b7be844aa7b406fa567b7c95f1a7bd788c8f8) Thanks [@kaore](https://github.com/kaore)! - Form building blocks taken from the agenda settings:

  - `Checkbox` and `Radio` take a `description`: a hint under the label, aligned
    with it, read as the control's description and dimmed with it when disabled.
  - `FormSection`: one part of a long form in its own surface, under a title.
  - `SelectTrigger` takes `triggerProps`, passed to the button itself.
  - `LinkButton` renders an `a` (it rendered a `div`, which `Pagination` used).
  - Field helper texts are `sm`, the size of the labels and inputs.
  - `controlLabel` spacing tokens (`xs` to `lg`): where a checkbox's or a radio's
    label starts, for what lines up with it.
  - `Pagination` with `getHref`: named previous and next links, a disabled button
    instead of an address-less link on the first and last pages, `aria-current`
    on the current page.

- [#816](https://github.com/OpenAgenda/oa/pull/816) [`6b75569`](https://github.com/OpenAgenda/oa/commit/6b75569323220f340fc9762db43b44bac954ce06) Thanks [@kaore](https://github.com/kaore)! - `MarkdownEditor` edits a text with headings, bold, italics, bulleted lists and links, read and written as markdown; inside a `Field` it takes the field's label, help, invalid and disabled states. It is built on tiptap, from Chakra's rich-text editor composition, whose frame, toolbar and buttons are exported as `RichTextEditor*`.

  `FileUploadButton` is a file upload trigger drawn as an outline button with an upload icon, for a single file where `FileInput`'s empty-field look reads as disabled.

- [#871](https://github.com/OpenAgenda/oa/pull/871) [`6ef8480`](https://github.com/OpenAgenda/oa/commit/6ef8480ddd1ed4cd7ab9beb2a83a7f61a9b841a6) Thanks [@kaore](https://github.com/kaore)! - `SortableList`: a list reordered by dragging its rows' handles, with the mouse,
  touch or the keyboard, each move announced to screen readers (dnd-kit); a row's
  own buttons show on hover and focus.

### Patch Changes

- [#876](https://github.com/OpenAgenda/oa/pull/876) [`1a6b6c3`](https://github.com/OpenAgenda/oa/commit/1a6b6c3f49ebd2ae7126817aa46c634d6a777ab3) Thanks [@kaore](https://github.com/kaore)! - `fg.error` and `fg.warning` are one step darker (red.700, orange.700 in light
  mode): Chakra's defaults stayed under the 4.5:1 contrast body text needs on
  white.

- [#876](https://github.com/OpenAgenda/oa/pull/876) [`4e0f8d2`](https://github.com/OpenAgenda/oa/commit/4e0f8d25ef511faeccd7ffcbe5707fbbe74d7dbb) Thanks [@kaore](https://github.com/kaore)! - The segmented control shows its selected segment in the palette's solid colour
  (primary by default) instead of a white pill barely raised from its bar.
  Its segments show the pointer cursor on hover.

## 0.5.0

### Minor Changes

- [#654](https://github.com/OpenAgenda/oa/pull/654) [`9b8839d`](https://github.com/OpenAgenda/oa/commit/9b8839d39639755f84553bf0ee83431195a92da1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `RadioCard` gains a `pill` variant: compact rounded choices on one wrapping row, meant without an indicator.

### Patch Changes

- [#655](https://github.com/OpenAgenda/oa/pull/655) [`d39f473`](https://github.com/OpenAgenda/oa/commit/d39f4739e2ee51fb9e72ae849c0ae396c66e489f) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `Status` shows `error` and `warning` in the `danger` and `warning` state palettes, instead of Chakra's raw `red` and `orange`.

## 0.4.0

### Minor Changes

- [#488](https://github.com/OpenAgenda/oa/pull/488) [`87aa0ec`](https://github.com/OpenAgenda/oa/commit/87aa0ecf621be0b3f0d5786a187fc1d1f19d6d2b) Thanks [@clement180](https://github.com/clement180)! - Add `availability.<status>.fg`, the text colour of a ticketing status.

  Six semantic tokens — `available`, `limited`, `soldOut`, `notYetOnSale`,
  `salesClosed`, `unknown` — each with a light and a dark value, backed by four
  new raw colours under `colors.availability`. Each raw colour is the most
  saturated of its hue that keeps a 4.5:1 contrast on white AND on `oaGray.100`,
  the desktop page background (5.3:1 and 4.6:1). No existing ramp had such a
  step: the 700s pass but read dull, green.600 fails, and the amber ramp jumps
  from 3.1:1 (800) to 7.8:1 (900). Additive; nothing existing changes.

- [#488](https://github.com/OpenAgenda/oa/pull/488) [`7e22504`](https://github.com/OpenAgenda/oa/commit/7e225045c2bc0fde140ac5d391ecde60ea57263e) Thanks [@clement180](https://github.com/clement180)! - Make `Badge variant="subtle"` readable, and give the amber ramp its missing ends.

  Chakra composes that variant as `colorPalette.fg` over `colorPalette.subtle`.
  On the OA palettes those two steps do not pair: `fg` is a MIDDLE step of the
  ramp (`warning.600`, `primary.500`) and `subtle` is step 100, already
  saturated. Measured on a rendered page, the result ran from 4.15:1 down to
  **1.39:1** for `warning` — amber text on amber, under the 4.5:1 the RGAA asks
  of normal text. The variant is now redefined on the `badge` recipe: step 50 for
  the background, step 900 for the text, mirrored in dark mode. Measured:
  primary 15.1 · danger 11.8 · oaGray 11.0 · warning 7.3 · green 8.5.

  The fix is on the recipe rather than on the semantic tokens on purpose. `fg`
  is also the text colour of ghost buttons and links; darkening it would move
  things far away from a badge.

  Two amber values come with it, because the ramp had neither end a pale chip
  needs:

  - **`warning.50` is new** (`#fef6e7`). There was no step below 100.
  - **`warning.900` is deepened**, `#a76906` → `#704b00`. It sat at L=34% where
    every sibling ramp reaches L=11–24%, which is why it read as a mid-tone
    rather than a text colour. Its only consumer, `Announcement` (amber text on
    white), goes from 4.50:1 to 7.79:1.

  `solid`, `outline` and `surface` are untouched — the OA recipe merges into
  Chakra's rather than replacing it.

- [#484](https://github.com/OpenAgenda/oa/pull/484) [`01eb410`](https://github.com/OpenAgenda/oa/commit/01eb4101c3062948ab3cdb8f375e458b32d7d399) Thanks [@kaore](https://github.com/kaore)! - Add `sand`, a warm tint palette with its light/dark semantic roles (`fg`, `subtle`, `muted`, `emphasized`, `solid`, `contrast`, `focusRing`), for content set apart from the live agenda, starting with the archives bar on the agenda page. And `states.archived`, the marker the archives get beside the event states (state tags, context bars).

### Patch Changes

- [#552](https://github.com/OpenAgenda/oa/pull/552) [`fada31b`](https://github.com/OpenAgenda/oa/commit/fada31bf1b0daafd53a127d9493404b0195c9f1a) Thanks [@kaore](https://github.com/kaore)! - Design system: secondary text (hints, detail lines, descriptions) never drops below body size. Next to body-size text it keeps that size and is set apart by a muted color; under a heading or a big figure it may be smaller, down to body size.

## 0.3.0

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

### Patch Changes

- [#281](https://github.com/OpenAgenda/oa/pull/281) [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Storybook from 10.2 to 10.5.7, along with `@storybook/react-webpack5`, `@storybook/html-vite` and `@storybook/addon-webpack5-compiler-babel` (4.0.0 to 4.0.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  All of these were already on `^10.2.0` carets that permitted 10.5.7, so the resolved version was the only thing lagging; the declarations now state what is installed.

## 0.2.0

### Minor Changes

- [#170](https://github.com/OpenAgenda/oa/pull/170) [`c70935e`](https://github.com/OpenAgenda/oa/commit/c70935ec5f6cb62d0e2bf823c47e6a5c823be969) Thanks [@kaore](https://github.com/kaore)! - Add `Surface`, a shared flat content-panel component (semantic `bg.panel` background + subtle `l3` radius, no border or shadow) for standalone blocks such as auth forms and error / empty states. Use it instead of hand-rolling a `Container`/`Box` with bg + border + radius + shadow, so those surfaces don't drift apart. Built with the chakra factory so it renders inside Server Components.

## 0.1.0

### Minor Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Breaking for early adopters (pre-1.0):

  - `Provider`'s `theme` prop is renamed to `system`, matching Chakra v3 vocabulary.
  - `createEmotionCache` and the theme system are named exports only (default exports removed); `react-remove-scroll` is re-exported as the named `RemoveScroll`.
  - Primary palette reworked (new `oaWhite` tokens, adjusted `frenchBlue`/`azure`/`mint`/`sepia`/`spotAliceBlue` values).
  - Responsive `Heading` sizes (h1–h4 scale down on mobile); new `input`, `textarea` and `native-select` recipes; `select` outline variant.
  - Chakra UI 3.24 → 3.34; build moves from tsup to tsdown with split `.d.mts`/`.d.cts` declarations and `sideEffects: false`.

## 0.0.3

### Patch Changes

- [`515a140`](https://github.com/OpenAgenda/oa/commit/515a140a8f56cebbe654a85afb3de2b6098322a3) Thanks [@bertho-zero](https://github.com/bertho-zero)! - upgrade chakra

- [`bfacacd`](https://github.com/OpenAgenda/oa/commit/bfacacdfb0d37bf82be9241e9690265db4a59a2e) Thanks [@bertho-zero](https://github.com/bertho-zero)! - add fontSize to html

## 0.0.2

### Patch Changes

- [`9cc12d5`](https://github.com/OpenAgenda/oa/commit/9cc12d5d9ae2d722b793dc2287423ca6da1a4e4f) Thanks [@kaore](https://github.com/kaore)! - darkened darkest warning text color
