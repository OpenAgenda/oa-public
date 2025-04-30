import { defineSlotRecipe } from '@chakra-ui/react';
import { blockquoteAnatomy } from '@chakra-ui/react/anatomy';

export const blockquoteSlotRecipe = defineSlotRecipe({
  slots: blockquoteAnatomy.keys(),
  base: {
    caption: {
      textStyle: 'md',
    },
  },
});
