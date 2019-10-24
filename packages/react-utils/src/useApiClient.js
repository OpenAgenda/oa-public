import { useContext } from 'react';
import ApiClientContext from './ApiClientContext';

export default function useApiClient() {
  const apiClient = useContext(ApiClientContext);

  return apiClient;
}
