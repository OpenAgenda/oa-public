import { tagsInputAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';
import { FIELD_HEIGHT } from './fieldFrame';

const HALO = '0 0 0 3px color-mix(in srgb, var(--field-halo) 25%, transparent)';
const THICK = 'inset 0 0 0 1px var(--field-halo)';

// The box values are typed into is a field, and takes the frame of one (see
// fieldFrame.ts): its border, its corners, its height, how it shows the focus
// and a refusal. Written again here because the box takes the focus through
// what is typed in it (`_focus`, where an input has `_focusVisible`), and
// keeps the tight inset its tags need.
export const tagsInputRecipe = defineSlotRecipe({
  slots: tagsInputAnatomy.keys(),
  base: {
    control: {
      borderRadius: 'control',
      '--field-halo': 'colors.colorPalette.solid',
      '--focus-color': 'colors.colorPalette.solid',
      _invalid: {
        '--field-halo': 'colors.border.error',
        boxShadow: THICK,
      },
    },
  },
  variants: {
    size: {
      md: {
        root: { '--tags-input-height': FIELD_HEIGHT },
      },
    },
    variant: {
      outline: {
        control: {
          borderColor: 'border.emphasized',
          _focus: {
            boxShadow: HALO,
            _invalid: { boxShadow: `${THICK}, ${HALO}` },
          },
        },
      },
    },
  },
});
