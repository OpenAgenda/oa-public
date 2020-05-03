import { useContext } from 'react';
import ApiClientContext from '../contexts/ApiClientContext';

export default function useApiClient() {
  const apiClient = useContext(ApiClientContext);

  return apiClient;
}
