# @openagenda/pdf-exports

## 0.0.6

### Patch Changes

- [#212](https://github.com/OpenAgenda/oa/pull/212) [`fd387c9`](https://github.com/OpenAgenda/oa/commit/fd387c9652f39dfcb6dc72aadceb312c1fb2a733) Thanks [@kaore](https://github.com/kaore)! - Bump `sharp` from `^0.31.1` to `^0.32.6` to remediate CVE-2023-4863 (GHSA-54xq-cgqr-rpm3) — a heap buffer overflow in the bundled `libwebp` dependency, fixed in sharp 0.32.6. The sharp image API is backward compatible across 0.31 → 0.32, so this is a drop-in security bump.

## 0.0.5

### Patch Changes

- Updated dependencies [[`a3bd9bd`](https://github.com/OpenAgenda/oa/commit/a3bd9bd75ac41e5f5c62bc7e43efcd8b376ffa99)]:
  - @openagenda/logs@1.2.1

## 0.0.4

### Patch Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Robustness and i18n fixes:

  - Guard against a potential infinite loop in `addParentElement` when no progress is made.
  - Handle empty image buffers, null registration entries and zero available height.
  - Smarter long-word splitting in `addText` (degenerate cases, line-fit rounding).
  - The "Contact details" label is internationalized (new `contactDetails` message); br/es locales are filled in and `nl` is added.

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/date-utils@0.0.2
  - @openagenda/intl@2.0.0
  - @openagenda/logs@1.2.0

## 0.0.3

### Patch Changes

- Updated dependencies [[`e962591`](https://github.com/OpenAgenda/oa/commit/e96259133ffb537992ca14f19de1cfc2dc512b6f)]:
  - @openagenda/intl@1.1.6

## 0.0.2

### Patch Changes

- Updated dependencies [[`9130206`](https://github.com/OpenAgenda/oa/commit/9130206f01c7b004965a026e357974f68c5d4dc9)]:
  - @openagenda/logs@1.1.10
