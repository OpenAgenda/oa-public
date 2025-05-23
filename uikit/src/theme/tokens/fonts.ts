import { defineTokens } from '@chakra-ui/react';

export const fonts = defineTokens.fonts({
  heading: {
    value:
      'var(--font-ubuntu-sans, ""), var(--font-noto-sans, ""), Helvetica, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  body: {
    value:
      'var(--font-noto-sans, ""), Helvetica, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
});
