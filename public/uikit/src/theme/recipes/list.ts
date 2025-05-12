import { defineSlotRecipe } from '@chakra-ui/react';
import { listAnatomy } from '@chakra-ui/react/anatomy';

export const listSlotRecipe = defineSlotRecipe({
  slots: listAnatomy.keys(),
  base: {
    root: {
      fontSize: 'sm',
    },
    item: {
      fontSize: 'sm',
    },
  },
});
