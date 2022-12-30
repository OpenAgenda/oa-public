import { checkboxAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const sizes = {
  sm: definePartsStyle({
    icon: { fontSize: '2xs' },
  }),
  md: definePartsStyle({
    icon: { fontSize: 'xs' },
  }),
  lg: definePartsStyle({
    icon: { fontSize: 'xs' },
  }),
};

export const checkboxTheme = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    control: {
      bg: 'whiteAlpha.900',
      border: '1px solid',
    },
  }),
  // sizes,
});
