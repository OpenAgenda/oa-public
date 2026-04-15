'use client';

import { createContext, useContext } from 'react';

const NonceContext = createContext<string | null>(null);

export function NonceProvider({
  nonce,
  children,
}: {
  nonce: string | null;
  children: React.ReactNode;
}) {
  return (
    <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
  );
}

export function useNonce() {
  return useContext(NonceContext);
}
