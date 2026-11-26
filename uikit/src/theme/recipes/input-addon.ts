import { defineRecipe } from '@chakra-ui/react';

// What is attached to a field — a prefix, a unit — is of its family: its
// corners, its resting border and its size are the field's (see
// fieldFrame.ts). Left to Chakra it kept a faint border and tighter corners
// beside the field it extends.
export const inputAddonRecipe = defineRecipe({
  base: {
    borderRadius: 'control',
  },
  variants: {
    // named so that it can be the default below; its measures are Chakra's
    size: { sm: {} },
    variant: {
      outline: {
        borderColor: 'border.control',
      },
    },
  },
  // Small unless said, as the field it is attached to
  defaultVariants: { size: 'sm' },
});
