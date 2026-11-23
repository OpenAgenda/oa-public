import { defineRecipe } from '@chakra-ui/react';
import { FIELD_INSET, fieldFrame } from './fieldFrame';

// Match the emphasized resting border applied to inputs (see input.ts).
export const textareaRecipe = defineRecipe({
  base: fieldFrame,
  variants: {
    size: {
      md: { px: FIELD_INSET },
    },
    variant: {
      outline: {
        borderColor: 'border.emphasized',
      },
    },
  },
});
