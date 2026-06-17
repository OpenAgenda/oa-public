---
'@openagenda/widgets': minor
'@openagenda/react': minor
---

Add a "horizontal cards" layout option to the agenda embed.

- `@openagenda/widgets`: the `oa-agenda` blockquote now accepts a `data-item-layout="horizontal"` attribute, forwarded as the `itemLayout` query param to the embed iframe.
- `@openagenda/react`: the agenda export modal exposes a checkbox to generate the `data-item-layout="horizontal"` snippet.

Horizontal cards render image-left / content-right (stacking on narrow widths) in a single full-width column.
