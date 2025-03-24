import React from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ChakraProvider, SystemContext } from '@chakra-ui/react';
import defaultTheme from './theme';
import { defaultCache } from './cache';

type UIKitProviderProps = React.PropsWithChildren<{
  theme?: SystemContext;
  cache?: EmotionCache;
}>;

export default function UIKitProvider({
  children,
  theme = defaultTheme,
  cache = defaultCache,
}: UIKitProviderProps) {
  return (
    <CacheProvider value={cache}>
      <ChakraProvider value={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
