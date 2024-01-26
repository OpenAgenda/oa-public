import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const baseStyle = defineStyle(props => {
  const { colorScheme: c } = props;

  if (!c) {
    return {};
  }

  return {
    color: mode(`${c}.500`, `${c}.200`)(props),
    _hover: {
      color: mode(`${c}.600`, `${c}.300`)(props),
    },
  };
});

export const linkTheme = defineStyleConfig({
  baseStyle,
  defaultProps: {
    // colorScheme: 'primary',
  },
});
