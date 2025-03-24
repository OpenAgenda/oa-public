import { defineRecipe } from '@chakra-ui/react';

export const linkRecipe = defineRecipe({
  base: {
    _hover: {
      color: 'colorPalette.fg',
    },
  },

  variants: {
    variant: {
      plain: {
        color: 'colorPalette.solid',
      },
    },
  },
});
