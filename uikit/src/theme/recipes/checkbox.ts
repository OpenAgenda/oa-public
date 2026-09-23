import { defineSlotRecipe } from '@chakra-ui/react';
import { checkboxAnatomy } from '@chakra-ui/react/anatomy';

export const checkboxRecipe = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    root: {
      cursor: 'checkbox',
    },
    control: {
      bg: 'bg',
    },
  },

  variants: {
    size: {
      xs: {
        control: {
          boxSize: '2',
        },
      },
      sm: {
        control: {
          boxSize: '3',
        },
      },
      md: {
        control: {
          boxSize: '4',
        },
      },
      lg: {
        control: {
          boxSize: '5',
        },
      },
    },
  },
});
