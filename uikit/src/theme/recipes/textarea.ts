import { defineRecipe } from '@chakra-ui/react';
import { FIELD_INSET, fieldFrame } from './fieldFrame';

// Match the emphasized resting border applied to inputs (see input.ts).
export const textareaRecipe = defineRecipe({
  base: fieldFrame,
  variants: {
    size: {
      sm: { px: FIELD_INSET },
      md: { px: FIELD_INSET },
    },
    variant: {
      outline: {
        borderColor: 'border.emphasized',
      },
    },
  },
  // Small unless said, as a button is: a field and a button left to their
  // defaults are the same height
  defaultVariants: { size: 'sm' },
});
