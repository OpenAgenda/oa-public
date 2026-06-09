import { defineRecipe } from '@chakra-ui/react';

// Match the emphasized resting border applied to inputs (see input.ts).
export const textareaRecipe = defineRecipe({
  variants: {
    variant: {
      outline: {
        borderColor: 'border.emphasized',
      },
    },
  },
});
