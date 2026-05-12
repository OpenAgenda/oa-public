import React from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ChakraProvider, SystemContext } from '@chakra-ui/react';
import { system as defaultSystem } from './theme';
import { defaultCache } from './cache';

type UIKitProviderProps = React.PropsWithChildren<{
  system?: SystemContext;
  cache?: EmotionCache;
}>;

export default function UIKitProvider({
  children,
  system = defaultSystem,
  cache = defaultCache,
}: UIKitProviderProps) {
  return (
    <CacheProvider value={cache}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
