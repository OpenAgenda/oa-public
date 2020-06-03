import { useContext } from 'react';
import ApiClientContext from '../contexts/ApiClientContext';

export default function useApiClient() {
  return useContext(ApiClientContext);
}
