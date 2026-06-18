---
'@openagenda/uikit': minor
---

Add `Surface`, a shared flat content-panel component (semantic `bg.panel` background + subtle `l3` radius, no border or shadow) for standalone blocks such as auth forms and error / empty states. Use it instead of hand-rolling a `Container`/`Box` with bg + border + radius + shadow, so those surfaces don't drift apart. Built with the chakra factory so it renders inside Server Components.
