import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const baseStyle = defineStyle({
  fontWeight: 'normal',
});

export const headingTheme = defineStyleConfig({
  baseStyle,
});
