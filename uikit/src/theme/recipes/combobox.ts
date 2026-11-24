import { comboboxAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';
import { FIELD_INSET, fieldFrame } from './fieldFrame';

// Emphasize the resting border of the input, and round it, to match inputs
// (see input.ts).
export const comboboxRecipe = defineSlotRecipe({
  slots: comboboxAnatomy.keys(),
  base: {
    input: fieldFrame,
  },
  variants: {
    size: {
      md: {
        root: {
          '--combobox-input-padding-x': `spacing.${FIELD_INSET}`,
        },
      },
    },
    variant: {
      outline: {
        input: {
          borderColor: 'border.emphasized',
        },
      },
    },
  },
});
