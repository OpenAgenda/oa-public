import { useCallback } from 'react';
import qs from 'qs';
import getQuerySeparator from '../utils/getQuerySeparator.js';

export default function useLoadGeoData(
  _apiClient,
  res,
  queryOrFn,
  options = {},
) {
  const { searchMethod = 'get' } = options;

  return useCallback(
    async (bounds, zoom) => {
      const query = typeof queryOrFn === 'function' ? queryOrFn() : queryOrFn;
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

      const result = await (
        searchMethod === 'get'
          ? fetch(
            `${res}${getQuerySeparator(res)}${qs.stringify(params, {
              skipNulls: true,
            })}`,
          )
          : fetch(res, {
            method: 'post',
            body: JSON.stringify(params),
            headers: {
              'Content-Type': 'application/json',
            },
          })
      ).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't load geo data");
      });

      return result.aggregations.geohash;
    },
    [res, queryOrFn, searchMethod],
  );
}
