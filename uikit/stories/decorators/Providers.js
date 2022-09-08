import React from 'react';

import {
  ChakraProvider,
  theme
} from '../..';

export default Story => (
  <ChakraProvider theme={theme}>
    <Story />
  </ChakraProvider>
);
