import { nativeSelectAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

// Native <select> fields inherit their outline border from Chakra's default
// (the faint `border` token). Emphasize it to match inputs (see input.ts).
// Note: the default nativeSelect copies the select trigger's outline styles at
// definition time, so this must be set on the nativeSelect `field` slot
// directly rather than via the select recipe.
export const nativeSelectRecipe = defineSlotRecipe({
  slots: nativeSelectAnatomy.keys(),
  variants: {
    variant: {
      outline: {
        field: {
          borderColor: 'border.emphasized',
        },
      },
    },
  },
});
