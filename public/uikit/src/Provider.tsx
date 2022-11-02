import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';

export default function UIKitProvider({ children }: React.PropsWithChildren) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}
