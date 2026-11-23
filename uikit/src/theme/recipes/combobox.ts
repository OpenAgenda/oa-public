import { comboboxAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

// Emphasize the resting border of the input to match inputs (see input.ts).
export const comboboxRecipe = defineSlotRecipe({
  slots: comboboxAnatomy.keys(),
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
