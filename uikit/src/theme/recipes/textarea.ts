import { defineRecipe } from '@chakra-ui/react';

// Match the emphasized resting border applied to inputs (see input.ts).
export const textareaRecipe = defineRecipe({
  base: {
    // The corners of a field (see radii.ts)
    borderRadius: 'field',
  },
  variants: {
    variant: {
      outline: {
        borderColor: 'border.emphasized',
      },
    },
  },
});
