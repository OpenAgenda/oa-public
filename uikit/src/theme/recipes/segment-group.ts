import { defineSlotRecipe } from '@chakra-ui/react';
import { segmentGroupAnatomy } from '@chakra-ui/react/anatomy';

// The selected segment in the palette's solid colour: Chakra's white pill on a
// light grey bar left the choice hard to tell at a glance
export const segmentGroupRecipe = defineSlotRecipe({
  slots: segmentGroupAnatomy.keys(),
  base: {
    root: {
      colorPalette: 'primary',
      '--segment-indicator-bg': 'colors.colorPalette.solid',
    },
    item: {
      // Clickable, as a radio is: Chakra leaves the arrow
      cursor: 'segment',
      _disabled: { cursor: 'not-allowed' },
      _checked: {
        color: 'colorPalette.contrast',
        fontWeight: 'medium',
      },
      // Before the indicator is measured, on the server render
      '&[data-state=checked][data-ssr]': {
        bg: 'colorPalette.solid',
      },
    },
  },
});
