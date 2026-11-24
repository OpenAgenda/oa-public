import { selectAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';
import { FIELD_INSET, fieldFrame } from './fieldFrame';

export const selectRecipe = defineSlotRecipe({
  slots: selectAnatomy.keys(),
  base: {
    trigger: {
      cursor: 'select',
      ...fieldFrame,
      // its placeholder is the text of the trigger itself
      _placeholderShown: { color: 'control.placeholder' },
    },
    item: {
      transition: 'backgrounds',
      _hover: {
        bg: 'colorPalette.subtle/30',
      },
    },
    // tweak to display the full text for inline select
    // https://github.com/chakra-ui/chakra-ui/blob/bf1a58145ea0555a62f79e8818ab7b0a4dcf8f85/packages/react/src/theme/recipes/select.ts#L118
    control: {
      '&:has([data-part="indicator"]) [data-part="trigger"]': {
        pe: 10,
      },
    },
    valueText: {
      maxW: 'full',
    },
  },
  variants: {
    size: {
      md: {
        root: {
          '--select-trigger-padding-x': `spacing.${FIELD_INSET}`,
        },
      },
    },
    variant: {
      // Emphasize the resting trigger border to match inputs (see input.ts).
      outline: {
        trigger: {
          borderColor: 'border.emphasized',
        },
      },
    },
  },
});
