import { useMemo } from 'react';
import { ApiClientContext } from '../contexts';
import apiClient from '../utils/apiClient';

export default function ApiClientProvider({ value = null, children }) {
  const client = useMemo(() => value || apiClient(), [value]);

  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}
