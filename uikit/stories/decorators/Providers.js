import React from 'react';

import {
  ChakraProvider
} from '@chakra-ui/react';

import theme from '../../theme';

export default Story => (
  <ChakraProvider theme={theme}>
    <Story />
  </ChakraProvider>
);
