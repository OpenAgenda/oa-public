import { tagsInputAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';
import { FIELD_HALO, FIELD_THICK_BORDER } from './fieldFrame';

// The box values are typed into is a field, and takes the frame of one (see
// fieldFrame.ts): its border, its corners, how it shows the focus
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
        boxShadow: FIELD_THICK_BORDER,
      },
    },
    // what the box suggests while empty, as any field (see fieldFrame.ts)
    input: {
      _placeholder: { color: 'control.placeholder' },
    },
  },
  variants: {
    // named so that it can be the default below; its measures are Chakra's
    size: { sm: {} },
    variant: {
      outline: {
        control: {
          borderColor: 'border.control',
          _focus: {
            boxShadow: FIELD_HALO,
            _invalid: { boxShadow: `${FIELD_THICK_BORDER}, ${FIELD_HALO}` },
          },
        },
      },
    },
  },
  // Small unless said, as a button is: a field and a button left to their
  // defaults are the same height
  defaultVariants: { size: 'sm' },
});
