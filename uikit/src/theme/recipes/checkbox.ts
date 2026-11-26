import { defineSlotRecipe } from '@chakra-ui/react';
import { checkboxAnatomy } from '@chakra-ui/react/anatomy';

export const checkboxRecipe = defineSlotRecipe({
  // `description`: the hint under the label, outside the control's label
  // element (the Checkbox snippet's `description`), aligned with the label
  slots: [...checkboxAnatomy.keys(), 'description'],
  base: {
    root: {
      cursor: 'checkbox',
    },
    control: {
      bg: 'bg',
    },
    description: {
      color: 'fg.muted',
      _disabled: {
        opacity: '0.5',
      },
    },
  },

  variants: {
    size: {
      xs: {
        control: {
          boxSize: '2',
        },
        description: {
          ps: 'controlLabel.xs',
          textStyle: 'xs',
        },
      },
      sm: {
        control: {
          boxSize: '3',
        },
        description: {
          ps: 'controlLabel.sm',
          textStyle: 'sm',
        },
      },
      md: {
        control: {
          boxSize: '4',
        },
        description: {
          ps: 'controlLabel.md',
          textStyle: 'sm',
        },
      },
      lg: {
        control: {
          boxSize: '5',
        },
        description: {
          ps: 'controlLabel.lg',
          textStyle: 'md',
        },
      },
    },
  },
});
