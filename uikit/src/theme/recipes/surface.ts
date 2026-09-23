import { defineRecipe } from '@chakra-ui/react';

// Shared content surface: a panel that sits on the page background for
// standalone blocks (auth forms, error / empty states, …). Intentionally flat —
// no border, no drop-shadow — so those elevations don't get re-invented ad hoc
// per page and drift apart. Owns only the surface identity (background +
// radius); callers own their own layout (padding, width, margins, alignment).
// New looks (e.g. an `elevated` variant) belong here as variants, never inline.
export const surfaceRecipe = defineRecipe({
  base: {
    bg: 'bg.panel',
    borderRadius: 'l3',
  },
});
