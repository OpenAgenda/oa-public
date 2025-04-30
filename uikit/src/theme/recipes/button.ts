import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  variants: {
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
