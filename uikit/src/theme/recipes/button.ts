import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  variants: {
    // size: {
    //   '2xs': {
    //     borderRadius: 'l1',
    //   },
    //   xs: {
    //     borderRadius: 'l2',
    //   },
    //   sm: {
    //     borderRadius: 'l2',
    //   },
    //   md: {
    //     borderRadius: 'l3',
    //   },
    //   lg: {
    //     borderRadius: 'l3',
    //   },
    //   xl: {
    //     borderRadius: 'l3',
    //   },
    //   '2xl': {
    //     borderRadius: 'l3',
    //   },
    // },

    variant: {
      link: {
        h: 'auto',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        px: '0',
        textStyle: 'none',
        lineHeight: 'normal',
        border: 'none',
        verticalAlign: 'baseline',
        color: 'colorPalette.solid',
        borderColor: 'transparent',
        _hover: {
          color: 'colorPalette.fg',
          textDecoration: 'underline',
        },
        _expanded: {
          color: 'colorPalette.fg',
          textDecoration: 'underline',
        },
      },
    },
  },
});
