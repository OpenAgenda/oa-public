# Design system (`@openagenda/uikit`)

The single source of truth for how UIs are built on top of `@openagenda/uikit`.
Read this **before building or editing any UI**. It is portable: it describes the
design system itself, not any one app, so every consumer (`packages/next` today,
sibling packages tomorrow) follows the same rules.

For app-specific composition conventions (page layout, dialog behavior in a given
app), see that app's own guidelines — e.g. [`packages/next/docs/UI-GUIDELINES.md`](../../../packages/next/docs/UI-GUIDELINES.md).

---

## The one rule: values live in code, never in prose

This document references token **source files** and never copies their values.
A hex code or font name written here would be wrong the moment the theme changes.
So:

- **Token values** (colors, fonts, cursor) → edited only in `src/theme/tokens/`.
- **Semantic mappings** (light/dark, `fg`/`subtle`/`solid`…) → only in `src/theme/semanticTokens/`.
- **Component variants** → only in `src/theme/recipes/`.
- **These rules / conventions** → only in this file.

Each thing has exactly one home. That is what "edited at the same place" means —
change a color in one file and every consumer updates; change a rule here and every
agent follows it.

---

## What's in the system

Built on **Chakra UI v3** (`createSystem`), CSS var prefix `oa`. Source of truth:

| Concern              | Source                                                       | Notes                                                                                               |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Raw tokens           | [`src/theme/tokens/`](../src/theme/tokens/)                  | `colors`, `cursor`, `fonts`                                                                         |
| Semantic tokens      | [`src/theme/semanticTokens/`](../src/theme/semanticTokens/)  | light/dark-aware `colors` (`fg`, `subtle`, `muted`, `emphasized`, `solid`, `contrast`, `focusRing`) |
| Single-part variants | [`src/theme/recipes/`](../src/theme/recipes/)                | button, heading, link, text                                                                         |
| Multi-part variants  | [`src/theme/recipes/`](../src/theme/recipes/) (slot recipes) | accordion, checkbox, menu, radioGroup, select, list, blockquote                                     |
| Global CSS           | [`src/theme/globalCss.ts`](../src/theme/globalCss.ts)        | base/reset styles                                                                                   |
| Composed system      | [`src/theme/index.ts`](../src/theme/index.ts)                | assembles all of the above into `system`                                                            |
| Prebuilt components  | [`src/components/`](../src/components/)                      | OA-authored (`Heading`, `NoBreak`)                                                                  |
| Snippets             | [`src/snippets/`](../src/snippets/)                          | Chakra composition snippets (Dialog, Field, Tooltip, Tag, …)                                        |

### Import surfaces

```ts
import { Button, Text, Icon } from '@openagenda/uikit'; // components + all of @chakra-ui/react
import { Dialog, Field, Tooltip } from '@openagenda/uikit/snippets';
import { system, themeConfig } from '@openagenda/uikit/theme';
```

`@openagenda/uikit` re-exports all of `@chakra-ui/react`, so import Chakra
primitives from uikit — **not** from `@chakra-ui/react` directly. That keeps a
single, swappable entry point.

---

## Rules for building UI

1. **Use semantic tokens, never literals.** No raw hex, rgb, or px for anything
   the theme defines. Use `colorPalette`/semantic tokens (`fg`, `subtle`,
   `solid`, …) and the spacing/typography scale so light/dark and rebrands just work.
2. **Reach for a snippet or component before composing from scratch.** If
   `src/snippets/` or `src/components/` already covers it, use it. Don't rebuild a
   Dialog/Field/Tooltip inline.
3. **Variants belong in recipes, not in `sx`/props.** A recurring visual variant
   of a component → add it to that component's recipe in `src/theme/recipes/`, then
   use it by name. One-off layout tweaks via props are fine; repeated styling is not.
4. **New shared component or token?** It goes here (in uikit), so every consumer
   gets it. Do not add design-system primitives in an app package.
5. **App-only composition stays in the app.** How a specific app arranges pages or
   wires a particular dialog is _not_ portable — keep it in that app's guidelines,
   not here.

---

## Editing protocol (decision table)

| You want to…                               | Edit                                                               | Then                     |
| ------------------------------------------ | ------------------------------------------------------------------ | ------------------------ |
| Change/add a color, font, cursor value     | `src/theme/tokens/`                                                | rebuild (`yarn prepack`) |
| Change light/dark or semantic role mapping | `src/theme/semanticTokens/`                                        | rebuild                  |
| Add/adjust a component variant             | `src/theme/recipes/` (+ register in `recipes.ts`/`slotRecipes.ts`) | add a story              |
| Add a shared component                     | `src/components/` (+ export in `index.ts`)                         | add a story              |
| Add a Chakra composition snippet           | `src/snippets/` (+ export in `index.ts`)                           | add a story              |
| Add/refine a **rule or convention**        | this file                                                          | —                        |
| Add an **app-specific** convention         | that app's guidelines doc                                          | —                        |

Every component/recipe change should come with a Storybook story in
[`../stories/`](../stories/) so the change is reviewable in isolation.
