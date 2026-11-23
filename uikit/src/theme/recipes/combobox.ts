import { comboboxAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

// Emphasize the resting border of the input, and round it, to match inputs
// (see input.ts).
export const comboboxRecipe = defineSlotRecipe({
  slots: comboboxAnatomy.keys(),
  base: {
    input: {
      // The corners of a field (see radii.ts)
      borderRadius: 'field',
    },
  },
  variants: {
    variant: {
      outline: {
        input: {
          borderColor: 'border.emphasized',
        },
      },
    },
  },
});
