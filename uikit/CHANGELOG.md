# @openagenda/uikit

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
