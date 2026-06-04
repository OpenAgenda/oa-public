# @openagenda/uikit

OpenAgenda's shared UI kit, built on [Chakra UI v3](https://chakra-ui.com/).
Provides the theme (tokens, semantic tokens, recipes), components, and snippets
used across OpenAgenda apps.

## Install

```sh
yarn add @openagenda/uikit
```

## Usage

```ts
import { Button, Text, Icon } from '@openagenda/uikit'; // components + all of @chakra-ui/react
import { Dialog, Field, Tooltip } from '@openagenda/uikit/snippets';
import { system } from '@openagenda/uikit/theme';
```

`@openagenda/uikit` re-exports all of `@chakra-ui/react`, so import Chakra
primitives from uikit rather than from `@chakra-ui/react` directly — keeping a
single, swappable entry point.

## Design system

[`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) is the canonical source of truth for
how UIs are built on top of uikit: where tokens, colors, fonts, variants, and
snippets live, the rules for using them (use semantic tokens, never hardcode
values; reach for existing snippets/components; variants live in recipes), and a
decision table for where to make each kind of change. **Read it before building or
editing any UI.**

## Storybook

```sh
yarn start    # storybook dev
```

Every component or recipe change should come with a story in [`stories/`](stories/).
