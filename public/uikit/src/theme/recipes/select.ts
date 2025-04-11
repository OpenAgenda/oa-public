import { selectAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

export const selectRecipe = defineSlotRecipe({
  slots: selectAnatomy.keys(),
  base: {
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
});
