import { tagsInputAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

// The box values are typed into is a field: its corners are those of an input
// (see radii.ts).
export const tagsInputRecipe = defineSlotRecipe({
  slots: tagsInputAnatomy.keys(),
  base: {
    control: {
      borderRadius: 'field',
    },
  },
});
