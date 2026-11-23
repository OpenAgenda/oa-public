import { tagAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

// Chakra draws a tag as it draws a badge: `colorPalette.fg` on
// `colorPalette.subtle`, which the OA palettes do not pair (see badge.ts) —
// 3.55:1 measured on a primary tag, under the 4.5:1 its text needs (RGAA 3.2).
// The same answer as for the badge, on the two variants that share the
// mistake: both ends of the ramp. `surface`, the default, keeps its outline.
const paired = {
  bg: 'colorPalette.50',
  color: 'colorPalette.900',
  _dark: {
    bg: 'colorPalette.900',
    color: 'colorPalette.50',
  },
};

export const tagRecipe = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  variants: {
    variant: {
      subtle: {
        root: paired,
      },
      surface: {
        root: paired,
      },
    },
  },
});
