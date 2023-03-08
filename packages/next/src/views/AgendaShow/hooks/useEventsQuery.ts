import useSWRInfinite from 'swr/infinite';
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
    },
  );
}
