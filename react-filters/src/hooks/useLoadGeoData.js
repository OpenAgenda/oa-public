import { useCallback } from 'react';
import qs from 'qs';

export default function useLoadGeoData(_apiClient, res, query) {
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
            radius: zoom === 0 ? 80 : 40,
          },
        ],
        geo: {
          northEast,
          southWest,
        },
      };

      const result = await fetch(`${res}?${qs.stringify(params, { skipNulls: true })}`)
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Can\'t load geo data');
        });

      return result.aggregations.geohash;
    },
    [res, query],
  );
}
