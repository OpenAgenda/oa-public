import React from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import type { Dict } from '@chakra-ui/utils';
import { ChakraProvider } from './components/ChakraProvider';
import defaultTheme from './theme';
import { defaultCache } from './cache';

type UIKitProviderProps = React.PropsWithChildren<{
  theme?: Dict
  cache?: EmotionCache
}>;

export default function UIKitProvider({
  children,
  theme = defaultTheme,
  cache = defaultCache,
}: UIKitProviderProps) {
  return (
    <CacheProvider value={cache}>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
