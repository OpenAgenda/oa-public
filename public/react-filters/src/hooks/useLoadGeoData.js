import { useCallback } from 'react';
import qs from 'qs';

export default function useLoadGeoData(apiClient, res, query) {
  return useCallback(
    async (filter, bounds, zoom) => {
      const northEast = bounds.getNorthEast().wrap();
      const southWest = bounds.getSouthWest().wrap();

      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        aggregations: [
          {
            type: 'geohash',
            size: 2000,
            zoom: Math.max(zoom, 1),
            radius: zoom === 0 ? 80 : 40
          },
        ],
        geo: {
          northEast,
          southWest,
        },
      };

      const result = (await apiClient.get(res, {
        params,
        paramsSerializer: p => qs.stringify(p, { skipNulls: true })
      })).data;

      return result.aggregations.geohash;
    },
    [apiClient, res, query]
  );
}
