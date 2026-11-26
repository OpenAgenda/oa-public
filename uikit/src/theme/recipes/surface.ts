import { defineRecipe } from '@chakra-ui/react';

// Shared content surface: a panel that sits on the page background for
// standalone blocks (auth forms, error / empty states, …). Intentionally flat —
// no border, no drop-shadow — so those elevations don't get re-invented ad hoc
// per page and drift apart. Owns only the surface identity (background +
// radius); callers own their own layout (padding, width, margins, alignment).
// New looks (e.g. an `elevated` variant) belong here as variants, never inline.
//
// `note` is the information box set inside a page or a dialog — a hint that
// steers the reader without alarming them (an alternative to the action they
// are about to take). Neutral and bordered, as the legacy pages' `info-block`,
// so the two stacks say "for your information" the same way. Messages with a
// status (error, warning, success) stay `Alert`s.
export const surfaceRecipe = defineRecipe({
  base: {
    borderRadius: 'l3',
  },
  variants: {
    variant: {
      panel: {
        bg: 'bg.panel',
      },
      note: {
        bg: 'bg.subtle',
        borderWidth: '1px',
        borderColor: 'border.muted',
        // The links' usual blue falls just short of 4.5:1 on this grey: a
        // step darker inside a note, hovered or not.
        '& a, & a:hover': {
          color: 'primary.600',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'panel',
  },
});
