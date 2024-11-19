import { useMemo } from 'react';
import { ApiClientContext } from '../contexts/index.js';
import apiClient from '../utils/apiClient.js';

export default function ApiClientProvider({ value = null, children }) {
  const client = useMemo(() => value || apiClient(), [value]);

  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}
