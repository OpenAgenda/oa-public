import { defineSlotRecipe } from '@chakra-ui/react';
import { radioCardAnatomy } from '@chakra-ui/react/anatomy';

// Adds `pill` to Chakra's own radio card variants: a short choice among a few,
// on one wrapping row (a key's permission shortcuts), where a full card would
// outweigh the list it fills. Meant without an indicator, the shape and the
// fill saying which is chosen; it sets its own padding, so `size` only scales
// the text. It keeps its width on the row, and wraps its text only when wider
// than the row. The focus is an outline: the base recipe says it by a fill,
// which `_checked` covers.
export const radioCardRecipe = defineSlotRecipe({
  slots: radioCardAnatomy.keys(),
  variants: {
    variant: {
      pill: {
        item: {
          flex: '0 1 auto',
          focusVisibleRing: 'outside',
          borderWidth: '1px',
          borderRadius: 'full',
          _checked: {
            bg: 'colorPalette.subtle',
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.solid',
          },
        },
        itemControl: {
          px: '3',
          py: '1',
        },
      },
    },
  },
});
