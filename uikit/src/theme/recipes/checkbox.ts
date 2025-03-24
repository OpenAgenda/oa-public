import { defineSlotRecipe } from '@chakra-ui/react';
import { checkboxAnatomy } from '@chakra-ui/react/anatomy';

export const checkboxRecipe = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    control: {
      bg: 'whiteAlpha.900',
    },
  },
});
