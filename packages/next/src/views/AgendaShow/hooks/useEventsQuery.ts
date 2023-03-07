import { useMemo } from 'react';
import router from 'next/router';
import useSWRInfinite from 'swr/infinite';
import qs from 'qs';
import { getEvents } from '@openagenda/react-filters';
import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';

export default function useEventsQuery({
  agenda,
  filters,
  query,
  includeFields,
  suspense = false,
}) {
  const upcomingOnly = !query.timings && query.passed !== '1';

  const mapFilter = useMemo(
    () => filters.find(v => v.name === 'geo'),
    [filters],
  );

  return useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.events) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['AgendaShow', 'events', agenda.slug, pageIndex, query, query.after];

      // add the cursor to the API endpoint
      return ['AgendaShow', 'events', agenda.slug, pageIndex, query, previousPageData.after];
    },
    (_page, _requestId, _slug, pageIndex, _query, after) => getEvents(
      null, // apiCLient
      `/api/agendas/slug/${agenda.slug}/events`,
      agenda,
      pageIndex === 0 ? filters : [], // need aggs only for first page
      {
        sort: query.search?.length ? 'score' : 'lastTimingWithFeatured.asc',
        size: 10,
        ...upcomingOnly ? {
          relative: ['current', 'upcoming'],
        } : null,
        ...query,
        after,
        passed: undefined, // omit passed
        includeFields,
        includeImageTimestamps: true,
      },
    ),
    {
      suspense,
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      use: [swrLaggyMiddleware],
      onSuccess(newData) {
        // Update map markers
        const mapElem = mapFilter?.elemRef.current;

        if (mapElem) {
          mapElem.onQueryChange(newData[0].aggregations.viewport);
        }

        const url = new URL(router.asPath, 'http://n').pathname + qs.stringify(query, { addQueryPrefix: true });

        if (url !== window.location.pathname + window.location.search) {
          router.push(
            new URL(router.asPath, 'http://n').pathname + qs.stringify(query, { addQueryPrefix: true }),
            null,
            { shallow: true },
          );
        }
      },
    },
  );
}
