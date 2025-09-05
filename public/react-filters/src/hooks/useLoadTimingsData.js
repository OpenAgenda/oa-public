import { useCallback } from 'react';
import qs from 'qs';
import getQuerySeparator from '../utils/getQuerySeparator.js';

export default function useLoadTimingsData(res, queryOrFn, options = {}) {
  const { searchMethod = 'get' } = options;

  return useCallback(
    async (additionalQuery = {}, { interval, timezone } = {}) => {
      if (!res) return null;

      const query = typeof queryOrFn === 'function' ? queryOrFn() : queryOrFn;

      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        ...additionalQuery,
        aggregations: [
          {
            type: 'timings',
            // size: 2000,
            interval,
            timezone,
          },
        ],
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
        throw new Error("Can't load timings data");
      });

      return result.aggregations.timings;
    },
    [res, queryOrFn, searchMethod],
  );
}
