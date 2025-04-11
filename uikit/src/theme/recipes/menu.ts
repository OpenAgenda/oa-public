import { menuAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

export const menuRecipe = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  variants: {
    variant: {
      subtle: {
        item: {
          _highlighted: {
            bg: 'colorPalette.subtle/30',
          },
        },
      },
    },
    // // If the default font-size is 14px
    // size: {
    //   sm: {
    //     trigger: {
    //       textStyle: 'sm',
    //     },
    //     item: {
    //       textStyle: 'sm',
    //     },
    //   },
    //   md: {
    //     trigger: {
    //       textStyle: 'md',
    //     },
    //     item: {
    //       textStyle: 'md',
    //     },
    //   },
    // },
  },
});
