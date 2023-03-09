import { apiClient } from '@openagenda/react-shared';

export default function getSSRApiClient(req = null) {
  return apiClient(process.env.NEXT_API_INTERNAL_BASE_URL, req);
}
