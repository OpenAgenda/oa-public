# @openagenda/uikit

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
