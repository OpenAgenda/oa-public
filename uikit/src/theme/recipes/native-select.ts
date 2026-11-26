import { nativeSelectAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';
import { FIELD_INSET, fieldFrame } from './fieldFrame';

// Native <select> fields inherit their outline border from Chakra's default
// (the faint `border` token). Emphasize it to match inputs (see input.ts).
// Note: the default nativeSelect copies the select trigger's outline styles at
// definition time, so this must be set on the nativeSelect `field` slot
// directly rather than via the select recipe.
export const nativeSelectRecipe = defineSlotRecipe({
  slots: nativeSelectAnatomy.keys(),
  base: {
    field: fieldFrame,
  },
  variants: {
    size: {
      sm: {
        field: { ps: FIELD_INSET },
      },
      md: {
        field: { ps: FIELD_INSET },
      },
    },
    variant: {
      outline: {
        field: {
          borderColor: 'border.control',
        },
      },
    },
  },
  // Small unless said, as a button is: a field and a button left to their
  // defaults are the same height
  defaultVariants: { size: 'sm' },
});
