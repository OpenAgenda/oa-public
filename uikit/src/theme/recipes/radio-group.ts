import { defineSlotRecipe } from '@chakra-ui/react';
import { radioGroupAnatomy } from '@chakra-ui/react/anatomy';

export const radioGroupRecipe = defineSlotRecipe({
  slots: radioGroupAnatomy.keys(),
  base: {
    item: {
      cursor: 'radio',
    },
    itemControl: {
      bg: 'bg',
    },
  },

  variants: {
    size: {
      xs: {
        itemControl: {
          boxSize: '2',
        },
      },
      sm: {
        itemControl: {
          boxSize: '3',
        },
      },
      md: {
        itemControl: {
          boxSize: '4',
        },
      },
      lg: {
        itemControl: {
          boxSize: '5',
        },
      },
    },
  },
});
