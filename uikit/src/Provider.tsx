import React from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ChakraProvider } from './components/ChakraProvider';
import theme from './theme';
import defaultCache from './cache';

type UIKitProviderProps = React.PropsWithChildren<{
  cache?: EmotionCache
}>;

export default function UIKitProvider({ children, cache = defaultCache }: UIKitProviderProps) {
  return (
    <CacheProvider value={cache}>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
