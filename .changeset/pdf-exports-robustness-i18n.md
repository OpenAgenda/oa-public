---
'@openagenda/pdf-exports': patch
---

Robustness and i18n fixes:

- Guard against a potential infinite loop in `addParentElement` when no progress is made.
- Handle empty image buffers, null registration entries and zero available height.
- Smarter long-word splitting in `addText` (degenerate cases, line-fit rounding).
- The "Contact details" label is internationalized (new `contactDetails` message); br/es locales are filled in and `nl` is added.
