import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(menuAnatomy.keys);

export const menuTheme = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    list: {
      borderRadius: 'base',
    },
    item: {
      _focus: {
        bg: 'primary.50',
      },
      _active: {
        bg: 'primary.100',
      },
    },
  }),
});
