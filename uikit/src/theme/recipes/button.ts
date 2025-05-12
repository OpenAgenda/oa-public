import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  variants: {
    size: {
      sm: {
        h: '9',
        minW: '9',
        px: '3.5',
        textStyle: 'sm',
        gap: '2',
        _icon: {
          width: '4',
          height: '4',
        },
      },
    },
    variant: {
      solid: {
        bg: 'colorPalette.solid',
        color: 'colorPalette.contrast',
        borderColor: 'transparent',
        _hover: {
          bg: 'colorPalette.solid/90',
        },
        _expanded: {
          bg: 'colorPalette.solid/90',
        },
      },
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
          textUnderlineOffset: '3px',
          textDecorationColor: 'currentColor/20',
        },
        _expanded: {
          color: 'colorPalette.fg',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textDecorationColor: 'currentColor/20',
        },
      },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'solid',
  },
});
