import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle(props => ({
  dialogContainer: {
    display: props.scrollBehavior === 'inside' ? 'flex' : 'grid', // https://github.com/chakra-ui/chakra-ui/issues/7224
  },
  dialog: {
    borderRadius: 'base',
    width: 'inherit',
  },
}));

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
});
