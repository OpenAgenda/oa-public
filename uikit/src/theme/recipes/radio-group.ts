import { defineSlotRecipe } from '@chakra-ui/react';
import { radioGroupAnatomy } from '@chakra-ui/react/anatomy';

export const radioGroupRecipe = defineSlotRecipe({
  // `itemDescription`: the hint under an item's label, outside the item (the
  // Radio snippet's `description`), aligned with the label
  slots: [...radioGroupAnatomy.keys(), 'itemDescription'],
  base: {
    item: {
      cursor: 'radio',
    },
    itemControl: {
      bg: 'bg',
    },
    itemDescription: {
      color: 'fg.muted',
      _disabled: {
        opacity: '0.5',
      },
    },
  },

  variants: {
    size: {
      xs: {
        itemControl: {
          boxSize: '2',
        },
        itemDescription: {
          ps: 'controlLabel.xs',
          textStyle: 'xs',
        },
      },
      sm: {
        itemControl: {
          boxSize: '3',
        },
        itemDescription: {
          ps: 'controlLabel.sm',
          textStyle: 'sm',
        },
      },
      md: {
        itemControl: {
          boxSize: '4',
        },
        itemDescription: {
          ps: 'controlLabel.md',
          textStyle: 'sm',
        },
      },
      lg: {
        itemControl: {
          boxSize: '5',
        },
        itemDescription: {
          ps: 'controlLabel.lg',
          textStyle: 'md',
        },
      },
    },
  },
});
