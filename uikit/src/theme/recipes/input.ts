import { defineRecipe } from '@chakra-ui/react';
import { FIELD_INSET, fieldFrame } from './fieldFrame';

// Emphasize the resting border of text inputs. Chakra's default outline
// variant uses the faint `border` token, which is barely visible against light
// backgrounds and makes fields read shorter/lighter than filled controls
// (buttons) sitting next to them. Deep-merged onto the default input recipe.
export const inputRecipe = defineRecipe({
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
