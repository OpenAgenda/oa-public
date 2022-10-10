import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';

const baseStyle = defineStyle({
  fontWeight: 'normal',
});

export const headingTheme = defineStyleConfig({
  baseStyle,
});
