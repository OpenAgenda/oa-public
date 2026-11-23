import { defineSlotRecipe } from '@chakra-ui/react';
import { fieldAnatomy } from '@chakra-ui/react/anatomy';

export const fieldRecipe = defineSlotRecipe({
  slots: fieldAnatomy.keys(),
  base: {
    // At the size of the labels and inputs it explains (Rule 7), not below:
    // Chakra's default is xs
    helperText: {
      textStyle: 'sm',
    },
  },
});
