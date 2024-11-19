import { useContext } from 'react';
import ApiClientContext from '../contexts/ApiClientContext.js';

export default function useApiClient() {
  return useContext(ApiClientContext);
}
