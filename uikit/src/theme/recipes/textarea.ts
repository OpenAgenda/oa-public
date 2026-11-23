import { defineRecipe } from '@chakra-ui/react';
import { fieldFrame } from './fieldFrame';

// Match the emphasized resting border applied to inputs (see input.ts).
export const textareaRecipe = defineRecipe({
  base: fieldFrame,
  variants: {
    variant: {
      outline: {
        borderColor: 'border.emphasized',
      },
    },
  },
});
